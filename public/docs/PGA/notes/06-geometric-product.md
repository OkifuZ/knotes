# 6. Geometric Product and Geometric Algebra

> PDF pages 19–24

The exterior algebra handles incidence (meet/join) and gives uniform representations for points, lines, planes. But it knows nothing about **measurement** — angles, distances.

## 6.1 From Exterior to Geometric Algebra

**The upgrade:** Instead of `v⊗v ∼ 0`, require:

```
v⊗v − B(v, v) ∼ 0
```

where B is a symmetric bilinear form. Now v⊗v reduces to a **scalar** (not necessarily zero). The resulting quotient of the tensor algebra is the **geometric algebra** (or Clifford algebra). The product is the **geometric product**, written as simple juxtaposition: **XY**.

**Alternative, equivalent definition** for two 1-vectors:

```
uv := u·v + u∧v
```

where · is the inner product from B, and ∧ is the exterior product. The geometric product contains **more information** than either alone. This definition extends uniquely to the whole graded algebra.

**Connection to exterior algebra:** When B is trivial (signature (0,0,n)), the geometric algebra reduces back to the exterior algebra.

## 6.2 Projective Geometric Algebra (PGA)

To model metric spaces (especially euclidean) à la Cayley-Klein, we interpret the geometric product in a projective setting — hence **projective geometric algebra (PGA)**.

Uses (n+1)-dimensional coordinates to model n-dimensional euclidean geometry.

**Notation:**
- Standard PGA (based on P(⋀)): **P(R\_{p,m,z})**
- Dual PGA (based on P(⋀\*)): **P(R\*_{p,m,z})**

PGA is a **family** of algebras, one per signature. The rest of the paper finds the specific member that models euclidean geometry — sometimes called **EPGA** ("euclidean PGA").

## 6.3 Geometric Algebra Basics

The geometric product of a k-vector and an m-vector is a sum of components at **different grades**:

```
ab = ⟨ab⟩₀ + ⟨ab⟩₂
```

Each grade expresses a different geometric aspect. An element with multiple grades is a **multivector**.

**Writing a multivector M:**

```
M = Σⁿᵢ₌₀ ⟨M⟩ᵢ
```

- **⟨M⟩ₖ** = the grade-k part of M
- The **highest-grade part** of a k-vector × m-vector product = (k+m)-grade, which equals the **wedge product** from the exterior algebra
- **Lower-grade parts** come from "contractions" — when a 1-vector square reduces to a scalar, dropping dimension by 2
- **Inner product a·b** = lowest-grade part = grade |k−m| (not always a scalar!)
- **Commutator product X×Y** := ½(XY − YX) — the anti-symmetric part

**Simple k-vectors:** those that can be written as the product of orthogonal 1-vectors (a₁a₂...aₖ where all aᵢ are orthogonal). Then the product equals the wedge product of those 1-vectors. Any multivector is a sum of simple k-vectors.

**Bivectors** = 2-vectors. **Trivectors** = 3-vectors.

**Reverse operator X̃:** reverses the order of 1-vectors in a simple k-vector:

```
X̃ = (−1)^(k(k−1)/2) X
```

Because a and b for orthogonal 1-vectors satisfy ba = −ab, and the exponent counts "neighbor flips" needed to reverse k items.

## 6.4 Example: Spherical Geometry via P(R\_{3,0,0})

Warm-up: the geometric algebra of R³ with orthonormal basis {e₀, e₁, e₂}.

A 1-vector u = xe₀ + ye₁ + ze₂ satisfies u² = x²+y²+z² = ‖u‖². The set ‖u‖ = 1 is the unit sphere (u and −u are the same projective point).

The product of two normalized 1-vectors:

```
uv = u·v + u∧v
```

- u·v = cos α (α = angle between spherical points)
- u∧v = the **great circle** (2-vector) through the points

**2-vector basis:** {E₀ := e₁e₂, E₁ := e₂e₀, E₂ := e₀e₁} — three mutually perpendicular great circles.

**Unit pseudoscalar:** I := e₀₁₂ = e₀e₁e₂.

Multiplication by I gives the **orthogonal complement** X⊥ = XI:
- 1-vector (pole point) → great circle (its equator)
- 2-vector (great circle) → its polar point

The full multiplication table is 8×8 (see Table 1 in the paper).

**Key insight:** {1, e₁₂, e₂₀, e₀₁} generates a sub-algebra isomorphic to Hamilton's quaternions H (with {1, i, j, k}).

The dual version P(R\*_{3,0,0}) also models spherical geometry, but with 1-vectors as great circles instead of points.

## 6.5 Determining the Signature for Euclidean Geometry

We need to find which (p,m,z) and whether standard or dual construction models **euclidean** geometry. Parallel lines are the clue.

**Angle between two euclidean lines** given by a₀x + b₀y + c₀ = 0 and a₁x + b₁y + c₁ = 0 (with a²ᵢ + b²ᵢ = 1):

```
a₀a₁ + b₀b₁ = cos α
```

Translating a line changes only its **third coordinate** c — it doesn't affect the angle. This coordinate is "superfluous" for the angle calculation.

Choose a basis for the dual projective plane so that:
- e₁ ↔ x=0
- e₂ ↔ y=0
- e₀ ↔ z=0 (the "superfluous" coordinate)

A line ax+by+c=0 corresponds to the 1-vector **ce₀ + ae₁ + be₂**.

For the geometric product of two such 1-vectors to produce a₀a₁ + b₀b₁ = cos α, the signature must be **(2, 0, 1)**.

**Therefore:** The correct PGA for E² is **P(R\*_{2,0,1})** — the dual construction with one degenerate dimension.

This is a **degenerate metric** (z ≠ 0). The ∗ in the name means it's built on the **dual** exterior algebra (inner product on lines, not points).

In dimension n: signature is **(n, 0, 1)**, giving **P(R\*_{n,0,1})** for Eⁿ.

**On degenerate metrics:** Much literature dismisses degenerate metrics, but the degeneracy here is exactly what models euclidean metric relationships faithfully. The "zero" coordinate e₀² = 0 captures the fact that parallel lines don't affect angles — an asset, not a liability.

---

*Next: Chapter 7 dives into 2D PGA in detail.*
