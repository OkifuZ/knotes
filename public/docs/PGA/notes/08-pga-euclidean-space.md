# 8. PGA for Euclidean Space: P(R\*_{3,0,1})

> PDF pages 36–46

## Setup and Notation

In 3D PGA:
- **Planes** = small roman (a, b) — 1-vectors, dual to points
- **Lines** = capital Greek (Ω, Σ) — 2-vectors, a new middle element
- **Points** = capital roman (P, Q) — 3-vectors

**Basis:** e₀ is the **ideal plane** (instead of ideal line in 2D). Three ideal points E₁, E₂, E₃ represent the x, y, z directions.

**Bivectors** have 6 coordinates (the 6 intersection lines of the 4 basis planes):
- e₀₁, e₀₂, e₀₃ = **ideal lines** (intersections of euclidean basis planes with the ideal plane)
- e₂₃, e₃₁, e₁₂ = **lines through origin** in x, y, z directions

Every bivector = sum of an ideal line and a line through the origin.

Many 2D formulas reappear: a·b = angle between two planes, etc. (See Tables 4 & 5 in the paper.)

The rest of this section focuses on what's **new in 3D**: bivectors.

---

## 8.1 Simple and Non-Simple Bivectors

In 2D, all k-vectors are **simple** (can be written as product of k 1-vectors). In 3D, this is no longer true for bivectors.

A **simple bivector** Σ = p₁∧p₂ is the intersection line of two perpendicular planes. It satisfies **Σ∧Σ = 0**.

### Sum of two skew lines = non-simple bivector

Let Σ₁ and Σ₂ represent **skew lines** (don't intersect, not parallel). They are linearly independent, so Σ₁∧Σ₂ ≠ 0. Then:

```
(Σ₁+Σ₂)∧(Σ₁+Σ₂) = 2Σ₁∧Σ₂ ≠ 0
```

Thus Σ = Σ₁+Σ₂ is **non-simple**: Σ∧Σ ≠ 0. Most bivectors are non-simple.

### Exponential of simple bivectors

Analogous to 2D:
- Euclidean Ω: e^{αΩ} = cos α + sin α·Ω (Ω² = −1)
- Ideal Ω∞: e^{dΩ∞} = 1 + d·Ω∞ (Ω∞² = 0)

---

## 8.1.1 Plücker's Line Quadric

The space of bivectors ⋀² is spanned by the 6 basis elements eᵢⱼ, forming a 5D projective space P(⋀²).

**Condition for a bivector to be a line:** Ω∧Ω = 0. In coordinates, Σaᵢⱼeᵢⱼ is a line iff:

```
a₀₁a₂₃ + a₀₂a₃₁ + a₀₃a₁₂ = 0
```

This defines the **Plücker quadric** L — a 4D quadric surface (signature (3,3,0)) inside P(⋀²). Points on L = lines; points off L = non-simple bivectors (**linear line complexes**), studied by Möbius as "null systems."

---

## 8.1.2 Product of Two Euclidean Lines

For normalized euclidean lines Ω and Σ (Ω² = Σ² = −1, Ω∧Σ ≠ 0 = skew):

```
ΩΣ = Ω·Σ + Ω×Σ + Ω∧Σ
    = cos α + (sin α·Π + d·cos α·Π⊥) + d·sin α·I
```

where:
- α = angle between lines, viewed along the common normal Π
- d = distance between lines measured along Π
- Π = the **euclidean common normal** (simple line perpendicular to both)
- Π⊥ = the **ideal common normal** (ideal line of perpendicular directions)
- d sin α·I = volume of tetrahedron from unit segments on Ω and Σ

**Geometric meaning:** ΩΣ as a sandwich is the composition of two half-turns → a **screw motion** around Π by 2α, translating by 2d from Σ toward Ω.

The motor carrying Σ to Ω is given by √(ΩΣ)̃.

**Special case — intersecting lines:** If lines share a point and plane, Ω∧Σ = 0. Common plane: (Ω∧e₀)∨Σ. Common point: ((Π∧e₀)∨Ω)∧Σ where Π = ⟨ΩΣ⟩₂.

---

## 8.1.3 The Axis of a Bivector

A non-simple euclidean bivector satisfies Θ² = Θ·Θ + Θ∧Θ = s + pI with s, p ≠ 0. Since it's euclidean, s < 0.

Numbers of the form s + pI are **dual numbers**. Their square root:

```
√(s + pI) = √s + p/(2√s)·I     (s > 0)
```

Define ‖Θ‖ = u + vI = √(−(Θ·Θ + Θ∧Θ)). Then:

```
Θ̂ := ‖Θ‖⁻¹Θ     and     Θ̂² = −1
```

Writing Θ = ‖Θ‖Θ̂ = (u+vI)Θ̂:

```
Θ = uΘ̂ + vΘ̂⊥
```

This decomposes a non-simple bivector into:
- **Θ̂** = the **euclidean axis** (a line)
- **Θ̂⊥** = the **ideal axis** (orthogonal ideal line)

Together they form the **axis pair**. The euclidean axis is primary; the ideal axis is derived by polarity: Θ̂⊥ = Θ̂I.

> Θ̂ is **not** projectively equivalent to Θ — it was multiplied by a dual number, not a real number.

---

## 8.1.4 Exponential of a Non-Simple Bivector

Since Θ̂ and Θ̂⊥ commute, the exponential of Θ = uΘ̂ + vΘ̂⊥ factorizes:

```
e^Θ = e^{uΘ̂} · e^{vΘ̂⊥} = e^{vΘ̂⊥} · e^{uΘ̂}
```

Applying the simple exponential formulas:

```
e^Θ = (cos u + sin u·Θ̂)(1 + vΘ̂⊥)
    = cos u + sin u·Θ̂ + v·cos u·Θ̂⊥ − v·sin u·I
    = (cos u − v·sin u·I) + (sin u + v·cos u·I)Θ̂
```

---

## 8.1.5 Bivectors and Motions

- **Simple bivectors** → simple motions: rotations (euclidean) or translations (ideal), as in 2D
- **Non-simple bivectors** → **screw motions**: rotation around a line (axis) + translation along it

A screw motion is characterized by its **axis** (unique fixed euclidean line) and **pitch** = translation distance / rotation angle (in radians).

---

## 8.1.6 The Motor Group

Motors are **even-grade** elements (bivectors + scalars + pseudoscalars) satisfying mm̃ = 1. They form the **motor group M** ⊂ P(R\*⁺_{3,0,1}), a 2:1 cover of the direct Euclidean group E⁺(3). (m and −m give the same isometry.)

Elements of form e^Ω (Ω ∈ ⋀²) are motors. A normalized simple bivector is itself a motor — produces a rotation of π around its line.

### Logarithm of a motor

Given a motor m, find Θ such that m = e^Θ.

A normalized motor has only even-grade parts:

```
m = ⟨m⟩₀ + ⟨m⟩₂ + ⟨m⟩₄ = s₁ + p₁I + (s₂ + p₂I)Θ̂
```

Solving for u, v (the axis pair parameters):

```
u = tan⁻¹(s₂, s₁),   v = p₂/s₁      (s₁ ≠ 0)
u = tan⁻¹(−p₁, p₂),  v = −p₁/s₂    (otherwise)
```

Then **log m = (u + vI)Θ̂** — unique up to adding multiples of 2π to u.

**Pitch** = v : u. The motor decomposes as:

```
m = e^{uΘ̂} · e^{vΘ̂⊥}
```

= rotation by 2u around axis Θ̂, composed with translation by 2v along Θ̂⊥.

**Lie theory connection:** Since exp: ⋀² → M is invertible (via log), M is a Lie group and ⋀² is its Lie algebra.

---

## 8.2 Kinematics and Rigid Body Mechanics

Summary of the PGA formulation:

1. **Kinematics** = continuous paths g(t) in the motor group.
2. **Two coordinate frames:** body (X_c) and space (X_s).
3. **Velocity bivectors:** Ω_c = g̃ġ (body), Ω_s = ġg̃ (space).
4. **Inertia tensor A** maps velocity to momentum: J⁻¹(A(Ω_c)) = Π_c.
5. **Kinetic energy:** E = Ω_c ∧ Π_c.
6. **Power:** Ė = −2Φ_c ∨ Ω_c (Φ_c = external force bivector in body frame).
7. **Work:** w(t) = E(t) − E(0) = ∫₀ᵗ Ė ds.
8. **Euler equations of motion:**

```
ġ = gΩ_c
Ω̇_c = A⁻¹(Φ_c + 2A(Ω_c) × Ω_c)
```

### Why this is better

- Linear and angular velocity/momentum are **unified** into single bivectors — no artificial separation
- No special role for the coordinate origin (no mysterious cross-products for angular quantities)
- A **simple force bivector** = line of action + intensity; a **force couple** = ideal line bivector
- Non-simple force bivectors decompose into axis pairs (simple force + orthogonal couple)

**Numerical advantage:** Integration space is 14D with solution space 12D — only 2 extra dimensions. Normalizing g brings you back to the solution space directly. In matrix or CGA approaches, the co-dimension is much larger, requiring Lagrange multipliers etc.

---

*See also: Tables 4 and 5 in the paper for 3D formula reference.*
