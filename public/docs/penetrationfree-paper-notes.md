# penetrationfree —— 没有 barrier 的 IPC 替代品

> **Robust and Efficient Penetration-Free Elastodynamics without Barriers**
> Juntian Zheng, Zhaofeng Luo, Minchen Li @ CMU / Genesis AI
> ACM TOG, SIGGRAPH 2026
> 开源：https://simulation-intelligence.github.io/barrier-free

---

## 一句话总结

**把 IPC 的 log 障碍函数换成"线性化距离 + 增广拉格朗日"，干掉 ill-conditioning 和 TOI locking 两大顽疾。最难的场景比 GIPC 快 ~98×。**

---

## 故事的起点：IPC 的两个老大难

### IPC 简介

IPC（Incremental Potential Contact, Li 2020）是当代最稳定的接触仿真方法。
核心思想：**用 log 障碍函数把"不穿模"变成势能项**：

```
B(d) = -(d - d̂)² · log(d / d̂)    当 d < d̂
B(d) = 0                          当 d ≥ d̂
```

距离 d 接近 0 时 B 趋于无穷大，逼着求解器避开穿模。

加上 CCD（连续碰撞检测）截断步长，IPC 给出**确定不穿模**的保证。这是它统治近年仿真领域的原因。

### 痛点 1：log barrier → ill-conditioned 系统

log 函数的二阶导在接触处疯狂增长：

```
B''(d) ~ 1 / (d - d̂)² + log 项
```

距离接近 d̂ 时，**Hessian 的某些块条件数飙到 10⁸ 以上**。

后果：
- 求解线性系统（Newton 步）的 PCG（预条件共轭梯度）要解几百上千次迭代
- GIPC 之类系统不得不用复杂预条件器（MAS preconditioner）勉强压住

### 痛点 2：TOI Locking

```
TOI = Time Of Impact，CCD 给出的"撞之前最大可走步长"
```

**IPC 每次 Newton 迭代的流程**：

```
xlast (无穿模)
  │
  │ Newton 给出理想 update p
  ↓
x̂ = xlast + p   (可能穿模)
  │
  │ CCD 算 TOI
  ↓
x = xlast + α · p   (α = TOI，截断到不穿)
  │
  │ 丢掉 x̂，从 x 开始下一轮
  ↓
xlast ← x，重复
```

问题：
- α 被**最早碰到的那一对** primitive 限制住
- 其他 pair 永远进不了约束集，得**反复 Newton**才能慢慢都收进来
- 碰撞密集场景（一堆软球被压扁）→ Newton 迭代数爆炸

```
            理想 Newton 步
xlast ●─────────────────────────● x̂
       \                       /
        \      被这对 pair      /
         \ ←── 截断到这        /
          ●━━━━━━━━━━━━━━●    ← 其他要碰的 pair（绿色）
         x_truncated         没机会被发现
```

---

## 核心想法

### 想法 1：从 x̂ 继续 Newton，不要丢掉

**关键转变**：不要每次都退回到无穿模状态 xlast，**而是从可能穿模的 x̂ 继续 Newton**。

这样所有要碰的 pair 一次性都暴露出来 → **跳出 TOI locking**。

```
传统 IPC:                     本文:
xlast → Newton → x̂           xlast → Newton → x̂
      → CCD → x               x̂ 直接进入下一轮 Newton
      → 丢 x̂                  TOI 用来更新乘子和约束集
      → 从 x 继续
```

### 想法 2：log barrier 没法用了

x̂ 是**穿模状态**，距离是负的。log(负数) 没定义，barrier 直接挂。

替代方案：

**步骤 A：把无符号距离线性化成有符号距离**

在最近的无穿模状态 xlast 处做一阶 Taylor 展开：

```
c_i(x̂) = d_i(xlast) + ∇d_i(xlast)ᵀ (x̂ - xlast) - ξ
```

ξ 是一个小的接触偏移（和 IPC 的 d̂ 类似）。

**步骤 B：增广拉格朗日代替 barrier**

```
L = E_elastic + Σᵢ [ (κ/2)(c_i(x̂) - sᵢ)² - λᵢ(c_i(x̂) - sᵢ) ]
                       ↑ 罚项                ↑ 拉格朗日项

s_i ∈ [0, ∞) 是松弛变量（slack），
λ_i 是估计的拉格朗日乘子，
κ 是罚刚度
```

**关键差别**：
- 普通罚函数法：把 κ 拉到无穷大 → ill-conditioned
- AL：**κ 保持适中，迭代更新 λ**，乘子自己长起来推动约束满足

```
λ ← λ - κ(c(x̂) - s)
```

最终 c(x̂) → ξ（一个小的安全间隙），约束精确满足，**系统条件数好得多**。

---

## 配套机制

光有 AL 还不够，论文做了三个工程优化才让方法 robust：

### 1. 约束过滤（filtering）

如果直接把 CCD 检测到的所有穿模对都加进活动集，活动集会爆炸。

**过滤策略**：每个顶点只保留它涉及的"最早 TOI"那一对。
- 不会漏关键约束（早 TOI 的对反复出现一定会被加）
- 活动集大小可控

### 2. Decay 机制

某个约束变成 inactive 后**不立刻删除**（防抖动），用 decay factor 慢慢淡出：

```
σ ← σ * 0.9   (每次 inactive 衰减)
σ < 0.01 时彻底删除
```

防止活动集在两个状态间反复横跳。

### 3. 累积 TOI 终止条件

不再用"梯度范数 < ε"作为终止，改用**累积 TOI 之和达阈值**：

```
Σ α[k] ≥ tolerance   →  停止
```

效果：在松一些的容差下也不会出现 IPC 那种"减振假象"（damping artifacts）。

---

## 算法整体流程

```
[每个时间步]
  x̂[0] ← x  (允许从穿模状态开始)
  C[0] ← 上一步的约束集
  for k = 0, 1, ...:
    ① 用 AL 解子问题：x̂[k+1] = SolveSubproblem(...)
       内部循环：
         - 算梯度 G、Hessian H（含 AL 项）
         - PCG 解 H·p = -G
         - line search
         - 更新 slack s
       直到 line search 取到 full step
    ② 更新乘子 λ_i，
    ③ 更新活动集 C[k+1]：CCD 添加新冲突对，过滤，decay
    ④ α[k+1] = MaxStepSize(x[k], x̂[k+1])
    ⑤ x[k+1] = (1-α)x[k] + α·x̂[k+1]
    ⑥ 累积 TOI 检查是否终止
```

---

## 性能

### 标杆场景：超压缩软球

```
5 个弹性软球 → 边界压扁到极限 → 释放回弹
2.61M DoF, 2.25M 四面体, 最多 1.45M 活动接触约束
```

| 系统 | 平均每帧 |
|---|---|
| GIPC | 大约 528 秒 |
| **本文** | **5.37 秒** |

**98.5× 加速**。

### 中等场景

| 系统 | 加速比 vs 本文 |
|---|---|
| Cubic Barrier (Ando 2024) | 5.05× 慢 |
| OGC (Chen 2025) | 33.1× 慢 |

### 困难场景

- vs Cubic Barrier：**最高 84.4× 加速**
- OGC：**直接挂掉**（artifact 严重，即使给它几个数量级的时间）
- vs GIPC：**最高 103×**

---

## 性能从哪来？

1. **PCG 迭代数**：log barrier 砍掉后，简单 block-Jacobi 预条件就够，迭代数减少几倍
2. **Newton 迭代数**：从 x̂ 继续 + 一次性发现所有 pair → 大幅减少
3. **GPU 优化**（论文 §5）：
   - 解析弹性 Hessian 在 SPD 投影下的快速组装
   - 罚刚度的条件数感知调整
   - 不用罚函数实现移动边界

---

## 给草履虫的直觉

> **IPC** 像挖了道高低差极大的护城河阻止穿模。挡是挡得住，但护城河旁边坡度太陡，求解器（PCG）爬坡爬得腿软（条件数差）。
>
> **本文** 把护城河换成"会自动加高的栅栏 + 看门人（拉格朗日乘子）"。栅栏高度（罚刚度 κ）保持适中不变，**让看门人 λ 自己学会越来越严**，最后约束也满足，求解器走起来还轻松。
>
> 顺便发现："让 Newton 从穿模状态继续走"反而让所有要碰的 pair 一次性暴露，跳出 TOI locking 死结。

---

## 给我自己的 takeaway

1. **IPC 的 log barrier 不是必须的**——这篇打开了"barrier-free penetration-free"这条新路线
2. **AL 的工程化**比想象中重要（filtering、decay、termination 三个机制缺一不可）
3. **TOI locking 的破解**是这篇的最大概念贡献，比 AL 替换更有启发性
4. 对游戏/Unity 物理：以后做高接触密度场景（一堆角色挤在一起），可以参考这篇绕开传统 PBD 的精度限制
