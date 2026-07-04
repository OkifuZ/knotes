# sparseMesh —— 给稀疏 Cholesky 找又快又好的重排序

> **Fast Sparse Matrix Permutation for Mesh-Based Direct Solvers**
> Zarebavani, Mahmoud, Dodik, Yuan, Porumbescu, Owens, Mehri Dehnavi, Solomon
> @ Toronto / MIT / Texas A&M / UC Davis / NVIDIA Research
> SIGGRAPH 2026
> 开源：https://github.com/BehroozZare/fast-permute

---

## 一句话总结

**用网格本身的 patch 划分当稀疏矩阵的"粗化结构"，跳过 METIS 多级粗化里最贵的那步。重排序快 10×，端到端 Cholesky 求解快 6×。**

---

## 故事的起点

### 一个反常识的事实

很多图形学应用的核心是**解大稀疏正定线性系统**：
- 网格参数化
- 形变 / ARAP
- 物理仿真的 Newton 步
- Mean Curvature Flow（平均曲率流）

通常用**稀疏 Cholesky 直接法**（`Ax = b → A = LLᵀ`）。

NVIDIA 最近搞了 cuDSS（GPU 上的稀疏 Cholesky），把数值分解和回代加速到飞起。**结果一测**：

```
端到端时间分布（Mean Curvature Flow）：
[========permute========][symbolic][numerical][solve]
     86%（最大达 96%）       ?         快        快
```

**重排序占了 86%！** 比真正的数值分解还贵。

### 啥是"重排序"？为啥要做？

稀疏 Cholesky 分解 `A = L Lᵀ` 时，L 通常**比 A 多很多非零元**——这叫 **fill-in**：

```
原矩阵 A（很稀疏）：       L（fill-in 多）：
●  ●                       ●
●  ●  ●                    ●  ●
●  ●  ●  ●                 ●  ●  ●
●  ●  ●  ●  ●         →    ●  ●  ●  ●
                           ●  ●  ●  ●  ●  ← 多出来的填充
```

如果先重排矩阵的行列（permute），fill-in 可以少几个数量级：

```
重排后：        L：
●        ●     ●        ●
   ●     ●        ●     ●
      ●  ●           ●  ●
●  ●  ●  ●  ●   →    ●  ●  ●  ●  ●
```

**找最优重排序是 NP 完全问题**，实际靠启发式：
- **AMD**（Approximate Minimum Degree）—— 局部贪心，便宜但不够好
- **Nested Dissection (ND)** —— 递归切割，质量好，并行性好
- **METIS** —— ND 的工业实现，跑得是不慢但还是慢

### 痛点

METIS 跑在 CPU 上、串行、用多级粗化算法找 separator：

```
ND 的核心步骤（每层递归）：
  ┌─────────────────┐
  │  原图 G          │
  │       ↓         │
  │  多级粗化        │  ← 这步最贵
  │       ↓         │
  │  在小图上找 separator │
  │       ↓         │
  │  refinement     │
  │       ↓         │
  │  分成左右两半    │
  └─────────────────┘
```

METIS **每层递归都要重新粗化一次**——大量重复工作。

---

## 核心想法

### Insight：网格自己就是天然的"粗化结构"

**关键观察**：在 FEM 离散下，矩阵的图（matrix graph）和**网格的邻接图**一一对应。

那为什么不直接用网格的 **patch 划分**当粗图？
- patch 算法本身在 GPU 上很快（RXMesh、MeshTaichi 都搞过）
- patch 间的 **quotient graph（商图）** 比原矩阵图小**几个数量级**
- 在小商图上跑 METIS 找 separator → 飞快
- **关键**：商图**只算一次**，整个递归共享

```
传统 ND（每层重新粗化）：
G₀ ──粗化──→ G_coarse → 找 separator → 分成 G_left, G_right
G_left ──粗化──→ ... 重新粗化
G_right ──粗化──→ ... 重新粗化

本文（一次粗化重复用）：
G₀ ──→ Q（商图，只算一次）
所有递归层都在 Q 上做 separator 决策
更新 Q 的节点权重和边权重，反映哪些已被分掉
```

### 牺牲了啥？

separator 的"小、平衡"要求被放宽：
- METIS 极力把 separator 缩到最小
- 这篇容忍稍大一点的 separator
- → fill-in 略多
- → 但**重排序时间下降几倍以上**
- 总体端到端**净赚**

---

## 算法 4 步

```
Input: 稀疏对称正定矩阵 A，网格 M，递归深度 nd_level
Output: 重排序 perm，elimination tree etree

Step 1: GPU 上把 mesh 切成 patches（用 RXMesh）
        - 这步可由用户提供，否则系统自己算

Step 2: 把矩阵图 G 的每个 vertex 映射到它所属的 patch
        - 构造 group map: gmap: V(G) → {1, ..., #patches}

Step 3: 在 quotient graph 上递归二分（patch-guided ND）
        for 每个 etree 节点:
          - 在当前商图上 METIS 找平衡二分
          - 把 patch 级的分割"提升"回顶点级，得到 separator superset
          - refine 这个 superset 让它更小
          - 把 separator 存到 etree 当前节点
          - 更新商图（移除已分配走的权重）
          - 递归处理左右两半

Step 4: 后序遍历 etree，串接每个节点的局部排序
        - 每个 etree 节点用 AMD 算它的局部排序
        - 按用户选的 schedule（post-order / level-order）拼起来
```

### 为啥 etree 是个 bonus

cuDSS 后续的 symbolic analysis 阶段**需要 elimination tree** 来调度并行分解。

传统流程是 permute 完之后**再花一道工序**重新算 etree。

这篇**在排序的过程中顺手就把 etree 生成好了**——直接喂给 cuDSS，又省一笔。

---

## 性能

### 重排序时间（permutation only）

vs METIS / cuDSS 自带的重排序：

| 指标 | 加速比 |
|---|---|
| 几何平均 | 4.58× |
| 最大 | **10.27×** |

### 端到端时间（permute + symbolic + numerical + solve）

集成进 cuDSS 之后的端到端：

| 指标 | 加速比 |
|---|---|
| 几何平均 | 3.51× |
| 最大 | **6.62×** |

### 适用场景

- 单次分解（一次性求解）
- **重复分解**（仿真里每帧重新求解）—— 这种场景下 permute 的成本被反复摊销，本方法收益更大

---

## 关键工程细节

1. **商图维护**：不每次从头扫整个矩阵建商图，而是建一次后**渐进更新**节点和边权重
2. **separator refinement**：用 METIS 自带的 refinement 策略缩小 separator
3. **etree 用 1D 数组存**：node `i` 的子节点是 `2i+1` 和 `2i+2`，cache 友好
4. **递归深度 9-10 就够**：再深加速比饱和

---

## 给草履虫的直觉

> 你要把一袋米按花色分成左右两堆，**传统办法**是一粒粒看（在原图上工作），找最完美的分界线。
>
> 这篇说："反正米是装在小袋子里的，**先按袋子分**就好了——稍微不平衡也无所谓，反正差不到哪去，省下的看每粒米的功夫够喝几壶。"
>
> 多层递归还共用同一套袋子标签（商图复用），不用每次重新打包。

---

## 给我自己的 takeaway

1. **稀疏直接法的瓶颈早就不是数值分解**了。NVIDIA 的 cuDSS 把数值阶段优化到极致后，**预处理变成最大头**。这跟 GPU 算力提升后内存带宽变瓶颈是同一个故事。

2. **领域知识 > 通用算法**。METIS 是个通用图分割器，不知道你的图来自网格。这篇直接用网格结构开外挂，性能立提一个量级。

3. **可复用副产品**：把"算 etree"和"算 permutation"合并，省掉一道独立工序——这种级联优化思路在性能工程里很值钱。

4. **对 Unity 仿真的可借鉴性**：如果做软体实时仿真要解大稀疏 SPD 系统，可以把网格 patch 划分（很多游戏引擎已经有了，比如做 LOD/可见性）顺便用作求解器加速。
