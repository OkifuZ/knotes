# localMesh —— GPU 上的网格自动微分

> **Locality-Aware Automatic Differentiation on the GPU for Mesh-Based Computations**
> Mahmoud, Goel, Ragan-Kelley, Solomon @ MIT
> ACM TOG 45(4), SIGGRAPH 2026
> 开源：https://github.com/owensgroup/RXMesh

---

## 一句话总结

**让网格上每个三角形/边的能量项的求导，全程跑在 GPU 寄存器和共享内存里，不写显存。结果：自动微分在 Newton 求解里从 80% 占比降到 12%。**

---

## 故事的起点

### 一个反直觉的事实

物理仿真里跑 Newton 法，每次迭代要做三件事：

1. 算梯度 ∇E 和 Hessian ∇²E（**自动微分**）
2. 把局部 Hessian 组装到全局稀疏矩阵
3. 解线性系统 `H·p = -g`（**线性求解**）

直觉上"线性求解最贵"。**但实际不是**。

论文里展示了一个 1002 顶点的质量弹簧布料模拟，单步 Newton 迭代里**自动微分占了 80%+**，线性求解只是个小尾巴。如下示意：

```
传统 AD 框架的 Newton 时间：
[========AD========][===组装===][solve]
   80%               15%         5%

理想：
[AD][solve][........剩余预算........]
```

### 为啥通用 AD 这么慢？

PyTorch、JAX、Warp、Enzyme、Dr.JIT 都是给"大稠密张量神经网络"设计的：

- 它们的中间梯度表示是 **dense 或 implicitly dense**
- 每个操作符产生一个张量，必须**写回 global memory**
- 下个操作符再**读回来**，不停在显存里来回搬

而网格能量是 **partially separable**：
- 一条边的能量只依赖这条边的 2 个端点
- 一个三角形的能量只依赖 3 个顶点
- 一个四面体只依赖 4 个顶点

**每个能量项是个超小 ℝⁿ → ℝ 的函数，n 通常 ≤ 12。**

通用 AD 完全没有利用这个稀疏性，把每个能量项都当大张量在算，导致 GPU 显存带宽全浪费在搬运上。

---

## 核心想法

### "局部就地计算"

**核心 insight**：每个能量项的所有计算（值、梯度、Hessian）都能装进 GPU 一个 thread 的寄存器或一个 block 的共享内存里。**只在最后"产出导数"那一刻，才写一次显存。**

具体技术栈：

#### 1. Per-element forward-mode AD

对小函数（≤12 维）用 **forward mode**（dual numbers）比 reverse mode 划算：
- 不需要构建计算图
- 不需要中间 tape
- 一次 forward pass 完成
- 用 **operator overloading** 实现，用户写正常 C++ 代码就行

```cpp
ActiveT d = (x0 - x1).squaredNorm();  // d 自带梯度信息
```

#### 2. Patch-based GPU 执行

基于 RXMesh 的 patch 划分（之前的工作）：
- 把 mesh 切成小 patch（比如 256 个面一组）
- 每个 patch 的连接性、属性都装进 GPU 一个 thread block 的共享内存
- patch 边界用 "ribbon"（幽灵元素）处理，避免跨 patch 通信

#### 3. 预分配的全局稀疏结构

setup 时就根据网格连接性算好全局 Hessian 的 sparsity pattern，运行时只往里**填值**：

```
[setup 一次]
- 分析每个能量项依赖哪些顶点 → stencil
- 算出全局 Hessian 的所有 nonzero 块位置
- 在 GPU 上分配好稀疏结构

[每次 Newton 迭代]
- 各 patch 并行算本地导数
- 通过预算好的 index map 直接 atomic add 到全局矩阵
```

#### 4. 动态稀疏（碰撞）

碰撞会动态产生新的 顶点-顶点 / 顶点-面 耦合：
- 用户在 GPU 上插入 pair（spatial hash / BVH）
- 系统在 GPU 上**就地更新 sparsity pattern**
- 完全不回 CPU

---

## 用户接口（看起来像 TinyAD）

```cpp
using T = float;
Mesh mesh("input.obj");
constexpr int VarDim = 3;
Problem<T, VarDim, VertexHandle> problem(mesh);

// 每条边的弹簧能量
problem.add_term<Op::EV>(  // EV = 每条边访问它的 V 顶点
  [=] (EdgeHandle eh, VertexIterator iter, VertexAttribute var) {
    auto x0 = var.active<ActiveT, 3>(eh, iter, 0);
    auto x1 = var.active<ActiveT, 3>(eh, iter, 1);
    ActiveT d = (x0 - x1).squaredNorm();
    return d;
  });

// 每个顶点的重力势能
problem.add_term<Op::V>(
  [=] (VertexHandle vh, VertexAttribute var) {
    if (is_fixed(vh)) return ActiveT(0);
    auto x = var.active<ActiveT, 3>(vh);
    return mass(vh) * gravity * x[2];
  });

problem.eval_terms();  // 自动算梯度、稀疏 Hessian、稀疏 Jacobian

T f = problem.get_current_energy();  // problem.grad / problem.hess / problem.jac
```

支持的 stencil 类型：`Op::V`、`Op::E`、`Op::F`、`Op::FV`、`Op::EV`、`Op::EF` 等。

**还支持**：

- 标量能量 → 梯度 + 稀疏 Hessian
- 向量值能量（残差）→ 稀疏 Jacobian（最小二乘问题用）
- Hessian-vector product（matrix-free）
- 在 lambda 里用 if/while 等控制流（甚至能跑 Newton 迭代算 sqrt）
- 复数变量（用于 frame field design）

---

## 性能

### 主测试：Spot 牛 demo

**700 头 Spot 牛**（210 万顶点）落到地面，弹性壳模拟：

- 自动微分占总时间仅 **12.2%**
- 瓶颈完全转移到线性求解器

### 跨任务对比

测试任务：
- 弹性 / 布料模拟
- 网格参数化
- ARAP 形变
- 网格平滑
- Frame field design
- 球面流形优化

对比对象：PyTorch、JAX、Warp、Enzyme、Dr.JIT、Thallo

**结论**：在所有涉及稀疏一阶/二阶导数的工作负载上，全面碾压。

### 与 Herholz 2024 的关系

Herholz 2024（最相关的同类工作）走"**符号微分 + 代码生成**"路线：
- 全局表达式图，做代数化简
- 编译时间长、内存高

本文走"**纯运行时 AD + 内存局部性**"路线：
- 不做符号化简
- 把所有微分压进 patch 内
- 两者**互补**：可以把这篇当 Herholz 系统的 GPU 后端

---

## 给草履虫的直觉

> 以前的 AD 像在工厂流水线上，每个工位（操作符）做完一道工序，把半成品**搬到仓库**（global memory），下个工位再从仓库拿出来。
>
> 这篇是把所有工序压缩进**一个工人手里**完成（一个 GPU thread），从原料进、成品出，中间不回仓库。读写少了，自然飞快。

---

## 给我自己的 takeaway

1. GPU 仿真早就过了"卷 ALU"的阶段，**memory locality 才是天花板**
2. forward-mode AD 在小维度场景下被严重低估，深度学习圈一边倒地用 reverse mode
3. patch-based 执行模型（RXMesh）的潜力比想象中大，可能未来几年的网格 GPU 系统都会跟进
