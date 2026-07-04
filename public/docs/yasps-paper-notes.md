# YASPS 论文阅读笔记 —— 通俗版

> **论文**：YASPS: A Symbolic Framework for Extensible, High-Performance IPC Simulation
> **作者**：Xuan Tang (UCSD), Kemeng Huang (港大/CMU), Gilbert Bernstein (UW), Minchen Li (CMU/Genesis AI), Tzu-Mao Li (UCSD)
> **发表**：ACM TOG 45(4), 2026 / SIGGRAPH 2026
> **关键词**：物理仿真、IPC、符号微分、GPU、可扩展性

---

## 0. 一句话总结

**YASPS 让你用 130 行 Python 给 IPC 仿真器加一种新材料/新参数化方式，性能还能跟硬写 CUDA 的 SOTA 打平。**

它做的是"基础设施"工作 —— 不是发明新的物理模型，而是发明一套"语法"，让加新物理变得容易。

---

## 1. 故事的起点：IPC 圈的老大难

### 1.1 什么是 IPC

IPC（Incremental Potential Contact）是 2020 年 Minchen Li 等人提出的一套碰撞处理方法。它最大的特点是**鲁棒到几乎不会穿模**：

- 把弹性、碰撞、摩擦统一成一个**能量最小化**问题
- 用障碍函数（barrier）让两个物体接近时能量飞涨，逼着求解器避开穿模
- 每一步用 Newton 法求解，需要算梯度 ∇E、Hessian ∇²E，然后解一个稀疏线性系统

它已经成了高质量物理仿真的事实标准（PolyFEM、GIPC、Stiff GIPC、Stark 都基于 IPC）。

### 1.2 痛苦在哪里

IPC 在算法上很统一，**但工程上是个噩梦**。

举个具体例子。假设你有一个软体仿真器（顶点位置就是自由变量），现在老板说："给我加上 ABD（Affine Body Dynamics，仿射体）支持，这样可以模拟近似刚体"。

ABD 里一个顶点的位置不是自由变量，而是：
```
p = A·p_rest + t
```
其中 A 是 3×3 仿射矩阵，t 是 3×1 平移。每个顶点的"自由度"从 3 个变成了 12 个（A 的 9 个 + t 的 3 个）。

听起来加一个公式而已对吧？真实情况是：

- **点-三角形碰撞**涉及 4 个顶点
- 每个顶点可能是软体顶点（3 DoF）也可能是 ABD 顶点（12 DoF）
- 排列组合：**3⁴ = 81 种情况**（如果再加 cage、shell 之类就是 4⁴、5⁴…）
- 每种情况的导数表达不同、Hessian 块大小不同、组装到全局矩阵的方式也不同
- 这些都得**手写 CUDA kernel**

GIPC 为了支持 ABD，硬写了 **1400 行 CUDA**专门处理 soft-soft / soft-rigid / rigid-soft / rigid-rigid 这 4 种情况。再想加个 cage 形变？再爆炸一次。

### 1.3 现有自动微分系统救不了

PyTorch、JAX、TinyAD、SymX 这些自动微分工具能帮你算导数，但它们只看到**当前这一种**计算图。如果你要表达"这个顶点位置可能是 A 也可能是 B"，它们的做法是分支，每个分支独立求导，结果还是会爆炸。

它们没法表达"**结构关系**"本身。

---

## 2. YASPS 的两个核心想法

### 2.1 把"结构"做成可微的一等公民

IPC 系统里其实存在两类**结构关系**，只是以前都藏在硬编码里：

| 关系 | 例子 |
|---|---|
| **聚合关系**（一对多） | 一个四面体由 4 个顶点构成；一条边由 2 个顶点构成 |
| **替换关系**（多选一） | 一个顶点位置 = 自由顶点 **或** ABD 算出的位置 **或** cage 算出的位置 |

YASPS 引入两个算子来表达这两种关系：

#### **JOIN**（聚合，类似数据库的 join）
> 给定一个连接关系（如 tet → 4 vertices），把目标顶点的属性"拉"到四面体上。
> ```python
> # 把每个顶点的 rest_position 拉到它所属的四面体上
> btrp = bunny.tets.addAttribute("rest_positions",
>     through=tet2v, source=bunny.vertices["rest_position"])
> # 结果：每个四面体有一个 4×3 的属性
> ```

#### **UNION**（合并异构）
> 把"形状一样、来源不同"的属性合成一个统一的可微节点。
> ```python
> bunnies.addPrimitiveUnion("vertices", [
>     bunny_affine.vertices,  # 这部分顶点位置由 ABD 算出
>     bunny_soft.vertices     # 这部分顶点位置是自由变量
> ])
> bunnies.vertices.addAttribute("position")
> ```
> 现在 `bunnies.vertices.position` 是一个**统一的属性**，它知道每个具体实例来自哪一支。

**关键点**：JOIN 和 UNION 自身是可微的运算。系统能对它们求导：
- JOIN 的导数 = 对每个被聚合的子节点分别求导，再 JOIN 起来（块对角结构）
- UNION 的导数 = 各分支导数的 UNION（运行时根据当前实例选分支）

### 2.2 为什么这能避免组合爆炸

回到点-三角形碰撞 81 种情况的问题：

**传统做法**：编译期生成 81 个 kernel，运行时根据具体情况派发。
**YASPS 做法**：编译期生成**一个**符号图。这个图里有 UNION 节点，运行时遇到 UNION 就根据 (instance_id, branch_id) 选分支。

代码不爆炸了 —— 不管 81 还是 256 还是 1024 种组合，符号图的大小都不变。

---

## 3. 一个具体例子串起来

论文里反复用的例子：**两只兔子 —— 一只软体，一只仿射体，互相碰撞**。

### Step 1：搭场景
```python
s0 = scene("scene0")
bunny_affine = s0.addMesh("bunny_affine")
bunny_soft   = s0.addMesh("bunny_soft")

bunny_affine.addPrimitive("vertices", numInstances=N_VERT)
bunny_affine.addPrimitive("affine_body", numInstances=1)
bunny_soft.addPrimitive("vertices", numInstances=N_VERT)
```

### Step 2：定义属性
```python
# 仿射体的 A、t
bunny_affine.affine_body.addAttribute("affine_matrix", 3, 3)
bunny_affine.affine_body.addAttribute("translation", 3, 1)
# 顶点的静止位置
bunny_affine.vertices.addConstant("rest_position", 3, 1)
```

### Step 3：表达"仿射兔子的顶点位置 = A·p_rest + t"

```python
# 把仿射体的 A 通过 JOIN 拉到每个顶点上
bva = bunny_affine.vertices.addAttribute("affine_matrix",
    through=bv2abd, source=bunny_affine.affine_body["affine_matrix"])
bvt = ... # 同理拉 translation

# 然后做计算
current_position = bva.resize(3,3) * bunny_affine.vertices["rest_position"] + bvt
```

注意：**这一切都是符号的**。`current_position` 是一个表达式树，不是数值。

### Step 4：UNION 两种顶点

```python
bunnies = s0.addMesh("bunnies")
bunnies.addPrimitiveUnion("vertices", [
    bunny_affine.vertices,
    bunny_soft.vertices
])
bunnies.vertices.addAttribute("position")  # UNION 后的统一位置属性
```

### Step 5：定义碰撞能量

```python
# 动态碰撞对（运行时由 CCD 决定）
bunnies.addPrimitive("pp", numInstances=0, isDynamic=True)
pp2v = bunnies.pp.addConnectivity("pp2v", bunnies.vertices, [], 2)
pp_positions = bunnies.pp.addAttribute("positions",
    through=pp2v, source=bunnies.vertices["position"])

def point_point(position, dHat, kappa):
    p0 = position.row(0)
    p1 = position.row(1)
    d = (p1 - p0).dot(p1 - p0)
    lenE = d - dHat
    return kappa * lenE * lenE * (d/dHat).log() * (d/dHat).log()

pp_energy = bunnies.pp.addAttribute("point_point",
    computed_attribute=point_point(pp_positions, DHAT, KAPPA))
```

### Step 6：注册能量、声明优化变量、求解

```python
s0.addEnergy(pp_energy, dynamic_instances=True)
s0.addEnergy(snh_energy)      # 软体的 Stable Neo-Hookean 弹性能
s0.addEnergy(affine_energy)   # ABD 的正交性约束能量

s0.addMinimizeTarget([
    bunny_soft.vertices["position"],
    bunny_affine.affine_body["affine_matrix"],
    bunny_affine.affine_body["translation"]
])

# 第一次调用时 JIT 生成所有 CUDA kernel，之后复用
result = s0.minimizeEnergy(tolerance=1e-6)
# result 是 Newton 步的更新方向
```

整个流程**完全没有手写 kernel，没有手写 Hessian 组装代码**。YASPS 自动：
1. 推断符号梯度和 Hessian
2. 推断全局 Hessian 的稀疏块结构
3. 生成并编译 CUDA kernel
4. GPU 上跑共轭梯度求解

---

## 4. 系统是怎么搭的（按数据流）

```
┌───────────────────────────────────────────────────────────┐
│  前端（Python）：用户用 JOIN/UNION 描述场景和能量          │
│   - scene → mesh → primitive type → attribute             │
│   - 用 JOIN 表达"由谁组成"                                 │
│   - 用 UNION 表达"可以是 A 也可以是 B"                     │
└────────────────────────────┬──────────────────────────────┘
                             ↓
┌───────────────────────────────────────────────────────────┐
│  符号微分器（Sec.5）                                        │
│   - 对计算图做两遍：                                        │
│     ① 沿"边界节点"切分计算图，本地求 J 和 ∇²f              │
│     ② 用二阶链式法则把它们组装成完整的 Hessian             │
│   - 利用 JOIN 块对角性质、UNION 路径合并                    │
│   - 复用中间导数（不同能量共享同一中间属性的导数）          │
└────────────────────────────┬──────────────────────────────┘
                             ↓
┌───────────────────────────────────────────────────────────┐
│  索引生成器（Sec.6, Appx A）                                │
│   - 推断每个能量的本地贡献该塞到全局 Hessian 哪个块         │
│   - 静态部分（弹性等连接性不变）一次算好                    │
│   - 动态部分（碰撞对）每帧重算                              │
└────────────────────────────┬──────────────────────────────┘
                             ↓
┌───────────────────────────────────────────────────────────┐
│  代码生成器 + JIT 编译（Sec.7）                             │
│   - 模块化：每个有名字的属性单独编译成 .o 文件              │
│   - 链接复用：多个能量共享中间属性的代码                    │
│   - Hessian 专用 kernel：自动做 PSD 投影（特征值钳位）      │
│   - 自动压缩本地 Hessian（去掉 UNION padding 的零行/列）    │
│   - 同 kernel 体编译多个块大小的特化版本                    │
└────────────────────────────┬──────────────────────────────┘
                             ↓
┌───────────────────────────────────────────────────────────┐
│  求解器（Sec.8, Appx B/C/D）                                │
│   - GPU 上的 PCG（预条件共轭梯度）                          │
│   - 全局 Hessian 用块稀疏存储 + 全局压缩（同坐标块合并）    │
│   - 自定义 SpMV kernel（按块大小特化展开）                  │
│   - 块 Jacobi 预条件                                        │
└───────────────────────────────────────────────────────────┘
```

不做的事情（故意留给用户/外部库）：
- **碰撞检测（CD/CCD）**：依赖具体参数化，写死在框架里反而限制扩展性。论文里直接拿 GIPC 的 CCD 来用。
- **Newton 步长控制 / 线搜索**：留给用户决定。

---

## 5. 几个特别聪明的小设计

### 5.1 PSD 投影矩阵自动收缩（44× 加速）

Newton 法要求 Hessian 是正定（PSD）的，工程上常用做法是对每个本地 Hessian 做特征值分解（EVD），把负特征值钳成零。**EVD 是 O(n³) 的，对大矩阵很慢**。

YASPS 用 UNION 表达"碰撞涉及的顶点可能是软体可能是 ABD"，最坏情况下本地 Hessian 是 24×24 的（两个 ABD 顶点）。

**关键观察**：本地 Hessian 经常能写成 `J^T · H_inner · J` 的形式（链式法则的一部分），其中 J 是 Jacobian，H_inner 是更小的"内部"Hessian。如果只把 H_inner 投影到 PSD，整体也保证 PSD（J^T·M·J ≥ 0 当 M ≥ 0）。

YASPS 在符号层就识别出"J 是线性映射 → curvature 项为 0 → 可以只投影 H_inner"。

实测：把投影矩阵从 24×24 缩到 6×6，**44× 加速**。

### 5.2 中间导数复用

考虑混合材质兔子：弹性能量、点-边碰撞、点-面碰撞**三种能量**都用到了 `bunnies.vertices.position` 这个 UNION 属性。

如果每个能量都从头求一遍 ∂position/∂(A,t,p_soft)，会重复算三次。

YASPS 沿着"边界节点"（JOIN/UNION/named attribute）切分计算图，每个边界节点的本地 Jacobian/Hessian **算一次共享**。

### 5.3 静态/动态连接性分离

弹性能量的连接关系（哪个四面体连哪 4 个顶点）一辈子不变 → 静态。
碰撞能量的连接关系（哪两个顶点形成碰撞对）每帧变 → 动态。

YASPS 把全局 Hessian 拆成 `H_static + H_dynamic`，索引计算和压缩各自做。论文里测试：1 块布 + 1 个兔子的场景，单次迭代里静态部分的索引计算占 46%，**不分离的话每帧都要重做这部分**。

### 5.4 模块化编译 + 并行 NVCC

YASPS 把每个有名字的属性、每个 JOIN/UNION 节点都编译成单独的 `.o` 文件。

为啥？因为：
1. NVCC 编译时间随代码量**严重非线性**增长（一个大文件 vs 一堆小文件，时间差几个数量级）
2. 多个 `.o` 可以并行编译
3. 多个能量共享中间属性时，对应的 `.o` 只编译一次

实测对比（log scale）：

```
Optimized (modular + parallel):     ~33 s
No Parallel (modular sequential):   ~80 s
Monolithic (单个大 kernel):         ~870 s
```

---

## 6. 性能数据：跟谁打？打得过吗？

### 6.1 对比对象

| 系统 | 实现方式 | 备注 |
|---|---|---|
| **GIPC** | 硬写 CUDA | IPC GPU 实现的 SOTA |
| **Stark** | C++ CPU | 主打机器人应用，强约束 |
| **YASPS** | Python + JIT 生成 CUDA | 本文 |

### 6.2 主测试：1-3 层布料砸到兔子上

39595 自由度，200 帧，时间步 0.01s。

| 系统 | 总时间 | Diff 平均/iter | CG 平均/iter | 备注 |
|---|---|---|---|---|
| YASPS | 139s | 13.5ms | 0.075ms | 用户写 Python |
| YASPS (优化) | 130s | 11.0ms | 0.075ms | 用户手动改写能量公式 |
| **GIPC** | **199s** | 8.8ms | 0.97ms | 全手写 CUDA |
| Stark | 跑崩了 | - | - | 线搜索失败 |

**结论**：用 Python 跑赢了硬写 CUDA 的 SOTA。

赢在哪？
- **CG 单次迭代快 13×**（0.075 vs 0.97）—— 因为 YASPS 的全局 Hessian 压缩 + 自定义 SpMV
- **Diff 慢一点**（13.5 vs 8.8）—— 因为 GIPC 用了解析 Hessian 而 YASPS 是符号求导

### 6.3 加新材料的代码量对比

| 场景 | YASPS LOC | GIPC/Stark LOC |
|---|---|---|
| Soft + Cloth | 776 | - |
| Soft + Cloth + ABD | +130 | GIPC: +1000+ |
| Soft + Cloth + ABD + Cage | +130 | 需要新一轮重写 |

**YASPS 端不用改任何东西**，全部增量都在用户的 Python 代码里。

### 6.4 跟其他自动微分系统的纯 Hessian 计算对比

对 Stable Neo-Hookean 能量算 Hessian（log scale）：

| 系统 | 相对 YASPS 的耗时 |
|---|---|
| YASPS | 1.0× |
| PyTorch | 159.9× |
| JAX | 33.3× |
| SymPy | 4.6× |

YASPS 在矩阵层做符号微分（不展开成标量），所以 det、inverse 这种矩阵运算保持紧凑形式，CSE（公共子表达式消除）效果好得多。

---

## 7. 论文中的几个炫技例子

1. **Cloth on Bunny**（基础测试，Sec 9.1）
2. **多兔子**：软的 + 仿射的 + 布料一起（Sec 9.2，加 ABD 只用 130 行）
3. **Caged Bunny**：表面被 cage 网格控制，cage 自己是 stable Neo-Hookean 四面体（Sec 9.3，再加 130 行）
4. **混合材质兔子**：同一只兔子部分软体、部分 ABD、部分固定（Sec 9.4）
5. **Repulsive Curve on Bunny**：把兔子先变形成球，在球上模拟排斥曲线，再映射回兔子（Sec 9.5，展示框架的通用性）

---

## 8. 局限和未来方向

作者很诚实：

- **编译时间**：百秒级（NVCC 慢 + CSE 算法基础）。代码缓存能复用，但首次跑很久。
- **GPU 内存**：UNION 按最大可能分配 thread-local 存储，会膨胀
- **不支持动态 arity**：比如顶点的邻接三角形数不固定（GPU kernel 静态内存的限制）
- **不支持自适应重网格**：属性数量变了就要重生成索引和 Hessian 结构
- **未来方向**：反向仿真（求解控制参数、材质参数等）、用户提供的解析特征值/特征向量

---

## 9. 给我自己的一句话直觉

**之前的仿真框架像是"硬编码每种食材怎么炒"。YASPS 发明了一套"食材组合的语法"（JOIN = 这盘菜由什么组成；UNION = 这种食材可以是猪肉也可以是鸡肉），你只要描述这个组合关系，系统就自动帮你写出所有炒法的 GPU 代码。**

加新材料从"一周写 1000 行 CUDA"变成"半小时写 130 行 Python"，性能还不掉 —— 这就是这篇论文的故事。

---

## 10. 跟自己工作的关联（自留思考）

- **Unity / 游戏中的布料、骨骼物理**：本质上也是局部能量 + Newton/Position-Based Dynamics。YASPS 的"结构作为一等公民"思路对 PBD 系统也有借鉴意义。
- **对 MagicaCloth 等系统**：它们的参数调试本质是在调本地能量的系数。YASPS 的"用户在 Python 里描述本地能量"模式如果能落地到 Unity，能极大降低自定义约束的门槛。
- **可微仿真**：YASPS 的下一步是反向仿真，这跟近年 ICLR/NeurIPS 上的 Differentiable Simulation 路线汇合，是个值得关注的方向。
