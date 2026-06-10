# PGA 术语表 / Glossary

按首次出现顺序排列。引用格式：§章节（PDF页码）。

---

## A

**analytic geometry (解析几何)**  
Descartes 创立的基于坐标系的几何方法，VLAAG 的前身。  
— §5.1 (p.11)

**anti-symmetric (反对称)**  
满足 u⊗v = −v⊗u，外积的基本性质。  
— §5.7 (p.14)

**automatic differentiation (自动微分)**  
利用对偶数（dual numbers）在计算函数值的同时精确求出导数。I² = 0 使得高阶项自动消失。  
— §9 (p.47)

**axis (轴)**  
3D 中螺旋运动的唯一不动欧氏线。对于非简单双向量，axis pair = 欧氏轴 + 理想轴。  
— §8.1.3 (p.40)

**axis pair (轴对)**  
非简单双向量的分解：Θ = uΘ̂ + vΘ̂⊥，其中 Θ̂ 是欧氏轴，Θ̂⊥ 是理想轴（Θ̂⊥ = Θ̂I）。  
— §8.1.3 (p.40)

---

## B

**basis (基)**  
向量空间中极大线性无关向量组，用来表示坐标。  
— §5.2 (p.11)

**bivector (双向量)**  
grade-2 的元素（2-vector）。在 2D 中表示点，在 3D 中表示线。  
— §6.2 (p.21)

**bilinear form (双线性形式)**  
B(u,v)，对每个参数分别线性的映射。用于定义内积和度量。  
— §5.3 (p.12)

---

## C

**Cayley-Klein model (Cayley-Klein 模型)**  
用射影空间中的二次型来嵌入欧氏（及非欧）度量的方法，PGA 的理论基础之一。  
— §5.1 (p.11)

**Clifford algebra (Clifford 代数)**  
几何代数的别称，以发明者 William Clifford 命名。  
— §6 (p.19)

**commutator product (对易子积)**  
X×Y := ½(XY − YX)，几何积的反对称部分。  
— §6.2 (p.21)

**co-vector (余向量)**  
对偶空间 V* 中的元素，是作用于向量产生实数的线性泛函：⟨θ, v⟩ ∈ R。  
— §5.2 (p.12)

---

## D

**degenerate metric (退化度量)**  
签名中 z ≠ 0 的度量，即存在平方为零的非零基向量。PGA 的欧氏签名 (n,0,1) 含有一个退化维度 e₀² = 0，这是精确建模平行关系的必要条件，而非缺陷。  
— §6.4 (p.24)

**dual exterior algebra (对偶外代数)**  
⋀*(V) = ⋀(V*)，其中 1-向量表示超平面（hyperplane），wedge 操作为 meet 而非 join。PGA 建立在对偶外代数之上。  
— §5.8 (p.15)

**dual numbers (对偶数)**  
形如 s + pI 的数，其中 1² = 1, I² = 0。PGA 的子代数，用于自动微分和双向量的归一化。  
— §8.1.3 (p.40)

**dual vector space (对偶向量空间)**  
V*，由 V 上的线性泛函组成。每个 V 有同构的 V*。  
— §5.2 (p.12)

**duality (对偶性)**  
射影几何的核心对称原理：点和平面、join 和 meet 的角色可以互换，命题的真值保持不变。  
— §5.1 (p.11)

---

## E

**Eⁿ (欧氏空间)**  
由点组成的度量空间，可以平移和旋转。区别于 Rⁿ（欧氏向量空间，只能绕原点旋转）。  
— §5.5 (p.13)

**EPGA (Euclidean PGA)**  
专指建模欧氏几何的 PGA 成员 P(R\*_{n,0,1})，以区别于其他签名的 PGA。  
— §6.1 (p.20)

**euclidean (欧氏的)**  
满足 X² ≠ 0 的元素，可以用欧氏范数归一化。反义词：ideal。  
— §7.1 (p.25)

**euclidean norm (欧氏范数)**  
对欧氏元素 X：X̂ := X / √|X²|，归一化后 X̂² = ±1。  
— §7.1 (p.25)

**even sub-algebra (偶子代数)**  
只含偶数 grade 的元素的子代数 P(R\*⁺)，motors 和 quaternions 所属的空间。  
— §8.1.6 (p.43)

**exponential (指数映射)**  
motor 的直接生成方式：e^{αP} = cos α + sin α·P（P² = −1）；e^{dP} = 1 + dP（P² = 0，理想点）。非简单双向量的指数产生螺旋运动。  
— §7.4 (p.35), §8.1.4 (p.41)

**exterior algebra (外代数 / Grassmann 代数)**  
⋀(V)，从张量代数通过 v⊗v ∼ 0 得到。积为 wedge product ∧，反交换、结合。维度 2ⁿ。  
— §5.7 (p.14)

**exterior product (外积)**  
→ wedge product

---

## G

**geometric algebra (几何代数)**  
通过 v⊗v − B(v,v) ∼ 0 从张量代数得到的商代数，乘积为 geometric product。Clifford 于 1878 年发明。  
— §6 (p.19)

**geometric product (几何积)**  
几何代数的基本乘积，写作 XY。对两个 1-向量：uv = u·v + u∧v。包含了内积（标量部分）和外积（高 grade 部分）的全部信息。  
— §6 (p.19)

**grade (级 / 阶)**  
k-vector 的 k。一个 k-向量属于第 k 级。multivector 是不同级分量的和。  
— §5.7 (p.14)

**Grassmann algebra (Grassmann 代数)**  
→ exterior algebra

---

## H

**homogeneous coordinates (齐次坐标)**  
在 n 维坐标上加一维：点 (x,y) → (x,y,1)；方向 (x,y) → (x,y,0)。PGA 使用 (n+1) 维坐标建模 n 维几何。  
— §6.4 (p.22), §7 (p.25)

**hyperbolic geometry (双曲几何)**  
e₀² = −1 时的非欧几何，P(R\*_{n,1,0}) 建模。  
— §11.2 (p.51)

---

## I

**ideal (理想的 / 无穷远)**  
满足 X² = 0 的元素，如理想点（方向向量）、理想线（无穷远线）、理想平面。用理想范数 ‖·‖∞ 归一化。  
— §7.1 (p.25)

**ideal norm (理想范数)**  
‖·‖∞，用于 X² = 0 的理想元素。对理想点 V = xE₁ + yE₂：‖V‖∞ = √(x²+y²)；对理想线 m = ce₀：‖m‖∞ = c。  
— §7.1 (p.26)

**ideal point / line / plane (理想点/线/平面)**  
分别对应方向向量、无穷远线、无穷远平面。平行线在理想点处相交。  
— §5.9 (p.16)

**inertia tensor (惯性张量)**  
6D 对称双线性形式 A，将速度双向量映射为动量双向量。  
— §8.2 (p.45)

**inner product (内积)**  
u·v := B(u,v)，标量，定义在向量对上。在几何代数中，内积是几何积的最低 grade 部分，不一定为标量。  
— §5.3 (p.12), §6.2 (p.21)

**isometry (等距映射 / 刚体运动)**  
保持距离不变的变换：旋转、平移、反射及其组合。PGA 中用 sandwich operator 实现。  
— §7.4 (p.32)

---

## J

**join (并)**  
∨，两个子空间的"张成"（span）。在 P(⋀*) 中通过 Poincaré 对偶从 P(⋀) 的 wedge 导入：X ∨ Y := J(J(X) ∧ J(Y))。  
— §5.10 (p.19)

---

## K

**kaleidoscope (万花筒)**  
§4.3 的示例：用两个平面的 sandwich 反射交替复合生成对称图案。  
— §4.3 (p.8)

**k-vector (k-向量)**  
grade k 的元素。0-向量 = 标量，1-向量 = 线/平面，2-向量 = 点/线，3-向量 = 点，4-向量 = 伪标量。  
— §5.7 (p.14)

---

## L

**Lie algebra (李代数)**  
motor 群 M 的李代数是双向量的空间 ⋀²，指数映射 exp: ⋀² → M 可逆（通过 log）。  
— §8.1.6 (p.44)

**line at infinity (无穷远线)**  
→ ideal line

**line quadric (线二次曲面)**  
→ Plücker quadric

**linear line complex (线性线丛)**  
非简单双向量，不在 Plücker quadric 上的 2-向量。Möbius 在静力学研究中称为 null system。  
— §8.1.1 (p.39)

**logarithm of motor (motor 的对数)**  
对 motor m，求 Θ 使 m = e^Θ。log m = (u + vI)Θ̂，其中 (u, v) 从 m 的标量/双向量的分量解出。唯一到加减 2π 的倍数。  
— §8.1.6 (p.44)

---

## M

**meet (交)**  
∧，两个子空间的交集。在 P(⋀*) 中 wedge product 就是 meet 操作。  
— §5.10 (p.19)

**motor (运动子)**  
归一化的 versor，满足 mm̃ = 1，属于 motor 群 M。可以是 rotator（旋转）或 translator（平移）。指数形式：m = e^Θ, Θ ∈ ⋀²。  
— §7.4 (p.35), §8.1.6 (p.43)

**motor group (运动群)**  
M ⊂ P(R\*⁺_{3,0,1})，所有 motor 构成的群，是直接欧氏群 E⁺(3) 的 2:1 覆盖（m 和 −m 对应同一运动）。  
— §8.1.6 (p.43)

**multivector (多重向量)**  
包含不同 grade 分量的元素的通称。M = Σ⟨M⟩ᵢ。  
— §6.2 (p.21)

---

## N

**non-simple bivector (非简单双向量)**  
3D 中不能写成两个 1-向量积的双向量。满足 Θ∧Θ ≠ 0。表示两条 skew lines 的和，对应螺旋运动。  
— §8.1 (p.36)

**normalize (归一化)**  
将元素乘以标量使其具有单位 weight。欧氏元素用欧氏范数；理想元素用理想范数。  
— §7.1 (p.25)

**normed vector space (赋范向量空间)**  
配备了对称双线性形式（内积）的向量空间，可用于测量角度和距离。  
— §5.3 (p.12)

**null system (零系)**  
→ linear line complex

---

## O

**orthogonal complement (正交补)**  
X⊥ := XI，乘以伪标量 I 得到正交补。在 P(R_{3,0,0}) 中：点的正交补是 equator 大圆。  
— §6.3 (p.22)

**orthogonal decomposition (正交分解)**  
利用 X² = ±1 和结合律：Y = ±X(XY) 得到 Y 关于 X 的正交分解。用于投影、最近点等问题。  
— §7.3 (p.30)

---

## P

**PGA (Projective Geometric Algebra, 射影几何代数)**  
在射影设定下解释几何积得到的代数族。P(R\_{p,m,z}) 为标准构造，P(R\*_{p,m,z}) 为对偶构造。欧氏几何对应 P(R\*_{n,0,1})。  
— §6.1 (p.20)

**pitch (螺距)**  
螺旋运动中平移距离与旋转角度（弧度）的比值。v : u 其中 log m = (u + vI)Θ̂。纯旋转 pitch = 0，纯平移 pitch = ∞。  
— §8.1.5 (p.43), §8.1.6 (p.44)

**Plücker coordinates (Plücker 坐标)**  
用 6 个坐标表示 3D 中的线，满足 a₀₁a₂₃ + a₀₂a₃₁ + a₀₃a₁₂ = 0 时表示一条线。  
— §8.1.1 (p.38)

**Plücker's line quadric (Plücker 线二次曲面)**  
L，P(⋀²) 中的 4D 二次曲面（签名 (3,3,0)），其上的点对应简单线（simple lines）。  
— §8.1.1 (p.38)

**Poincaré duality (Poincaré 对偶)**  
映射 J: P(⋀) ↔ P(⋀*)，grade-reversing 的同构（x ↔ x*），使 join 和 meet 可在同一代数中共存。  
— §5.10 (p.18)

**polarity (极性)**  
乘以伪标量 I 得到正交补的操作：X → XI。  
— §7.2 (p.27)

**polymorphism (多态性)**  
同一公式对不同类型参数（欧氏/理想、相交/平行）产生语义正确的结果，无需分支或特殊情形。PGA 的核心优势。  
— §7.2 (p.28)

**projective exterior algebra (射影外代数)**  
对外代数进行 projectivize 得到 P(⋀(V)) 和 P(⋀*(V))。grade k 的元素表示维度 k−1 的子空间。  
— §5.10 (p.17)

**projective space (射影空间)**  
RPⁿ⁻¹，通过 u ∼ λv (λ ≠ 0) 将 n 维向量空间 projectivize 得到。点 = V 中过原点的线。  
— §5.9 (p.15)

**pseudoscalar (伪标量)**  
最高 grade 的元素 I = e₀e₁...eₙ，grade (n+1)。在 2D PGA 中表示整个平面，I² = 0。乘以 I 即为极性操作。  
— §5.10 (p.18), §7 (p.26)

---

## Q

**quadratic form (二次型)**  
用于在射影空间中嵌入度量的代数结构。Cayley-Klein 方法的核心。  
— §5.1 (p.11)

**quaternions (四元数)**  
Hamilton 发明的代数。在 P(R\_{3,0,0}) 中由 {1, e₁₂, e₂₀, e₀₁} 生成的子代数同构于四元数 H。在 P(R\*_{3,0,1}) 的偶子代数中嵌入了对偶四元数（dual quaternions）。  
— §6.3 (p.22), §11.3.4 (p.52)

---

## R

**reflection (反射)**  
由 sandwich aXa 实现，其中 a 是线（2D）或平面（3D）。a² = 1 → 重复反射 = 恒等。  
— §7.4 (p.32)

**regressive product (回归积)**  
从对偶代数导入的外积，即 join ∨。区别于 wedge product（meet）。  
— §5.10 (p.19)

**reverse (反转)**  
X̃，反转简单 k-向量中 1-向量的乘积顺序。X̃ = (−1)^{k(k−1)/2} X。用于 motor 的逆：m̃ = m⁻¹。  
— §6.2 (p.21)

**rigid body mechanics (刚体力学)**  
在 PGA 中表达为 motor 群上的运动学 + 双向量的动力学，得到统一的 Euler 方程。  
— §8.2 (p.45)

**rotator (旋转子)**  
motor 为旋转时（轴为欧氏线）：R = e^{αΩ} = cos α + sin α·Ω。  
— §7.4 (p.35)

**rotation (旋转)**  
两次反射的复合，由 motor sandwich RXR̃ 实现。  
— §7.4 (p.33)

---

## S

**sandwich operator (三明治算子)**  
形式为 gXg̃ 的变换表达式。1-向量反射：aXa；motor 变换：mXm̃。适用于任何 grade 的元素。  
— §7.4 (p.32)

**screw motion (螺旋运动)**  
3D 中最一般的保向等距映射：绕轴旋转 + 沿轴平移。由非简单双向量的指数生成。PGA 中统一表示旋转和纯平移。  
— §4.4 (p.9), §8.1.5 (p.42)

**signature (签名)**  
(p, m, z) 三元组，由 Sylvester 定理唯一确定。p = 正维度数，m = 负维度数，z = 退化（零）维度数。欧氏 PGA 的签名为 (n, 0, 1)。  
— §5.4 (p.13)

**simple k-vector (简单 k-向量)**  
可写为 k 个正交 1-向量之积的 k-向量。在 2D 中所有 k-向量都是简单的；3D 中双向量可能是非简单的。  
— §6.2 (p.21)

**skew lines (异面线 / 相错线)**  
既不平行也不相交的两条线。它们的和产生非简单双向量。  
— §8.1 (p.37)

**spherical geometry (球面几何)**  
P(R_{3,0,0}) 建模的几何，1-向量表示球面上的点。  
— §6.3 (p.21)

**Sylvester signature theorem (Sylvester 签名定理)**  
每个 n 维对称双线性形式由唯一的 (p, m, z) 刻画，p+m+z = n，且存在正交归一基。  
— §5.4 (p.13)

---

## T

**tensor algebra (张量代数)**  
T(V) = ⊕Tₖ，由张量积 ⊗ 生成的无限维代数。外代数和几何代数的构造基础。  
— §5.6 (p.13)

**tensor product (张量积)**  
⊗，双线性的乘积，生成张量代数。  
— §5.6 (p.13)

**translator (平移子)**  
motor 为平移时（轴为理想线）：T = e^{dΩ∞} = 1 + d·Ω∞。  
— §7.4 (p.35)

**trivector (三向量)**  
grade-3 的元素（3-vector）。在 3D 中表示点。  
— §6.2 (p.22)

**turn (半转)**  
用简单欧氏双向量 Ω 的 sandwich：ΩXΩ̃，产生绕 Ω 的半周旋转。两个 turn 的复合可生成所有直接等距映射。  
— §8.1.2 (p.39)

---

## V

**vector space (向量空间)**  
对加法和标量乘法封闭的集合。基的基数 = 维度 n。  
— §5.2 (p.11)

**velocity bivector (速度双向量)**  
Ω_c = g̃ġ（体坐标）或 Ω_s = ġg̃（空间坐标）。统一了线速度和角速度。  
— §8.2 (p.45)

**versor (乘积子)**  
k 个欧氏 1-向量的乘积，代表 k 次反射的复合。motor 是归一化的 versor。  
— §7.4 (p.35)

**VLAAG**  
Vector and Linear Algebra + Analytic Geometry。指目前主流的欧氏几何计算方法（向量代数 + 线性代数 + 解析几何）。PGA 正在挑战其地位。  
— §1 (p.3)

---

## W

**wedge product (楔积 / 外积)**  
∧，外代数的乘积。反交换、结合。在 PGA 中 = 几何积的最高 grade 部分。在 P(⋀*) 中是 meet 操作。  
— §5.7 (p.14)

**weight (权重)**  
元素的范数 ‖X‖ = d ∈ R 称为 weight d。归一化元素 weight = 1。计算中保留 weight 携带几何信息（不完全 projectively 地工作）。  
— §7.1 (p.26)

---

> 引用来源: Charles G. Gunn, *Geometric Algebra for Computer Graphics*, SIGGRAPH 2019 Course Notes.
