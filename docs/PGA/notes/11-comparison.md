# 11. Comparison

> PDF pages 48–54

Table 6 in the paper provides a feature-by-feature comparison of PGA vs. VLAAG. PGA fulfills **every item** on the wish list from Chapter 2; VLAAG offers almost none.

## 11.1 Conceptual Differences

### 1. Primitive-neutral (PGA) vs. point-centric (VLAAG)

VLAAG builds lines and planes from points and vectors. PGA's exterior algebra treats points, lines, and planes as **equal citizens** — each is a distinct grade.

### 2. Projective foundation handles parallelism uniformly

PGA's ideal elements integrate parallelism seamlessly. The **ideal norm** produces polymorphic formulas that correctly handle both intersecting and parallel cases with the same expression (e.g., `a∧b` gives the intersection point for intersecting lines, and a weighted ideal point encoding distance for parallel lines).

### 3. Unified euclidean + ideal elements of all dimensions

PGA unifies:
- Rotations and translations (both are motors — exponentials of euclidean vs. ideal bivectors)
- Simple forces and force couples (both are force bivectors — euclidean vs. ideal lines)

VLAAG has separate rules for each; the user must track which is which.

### 4. Unified isometry representation

PGA sandwich operator `gXg̃` works on **any grade** — same form for points, lines, and planes. VLAAG uses different matrix forms for each.

### 5. Operator = operand

In PGA, a plane `a` both **is** the plane and the **reflection operator** in that plane. In VLAAG, the matrix for reflection differs from the vector representing the plane.

### 6. Compact, polymorphic formulas

Tables 3, 4, 5 in the paper show ~50 formulas that work across all argument types. VLAAG equivalents are ad hoc, full of special cases, and separate per primitive type.

---

## 11.2 The Expressiveness of PGA

PGA's syntax embeds multiple conceptual distinctions into a **unified form**:

- Points / lines / planes (grade)
- Euclidean / ideal (norm type)
- Operator / operand (same element)
- Join / meet (∨ / ∧)

Result: many more basic geometric expressions combine **meaningfully** with each other.

The paper claims PGA is the **"world champion"** in formula compactness, completeness, and polymorphicity among all frameworks for euclidean geometry.

### Non-euclidean metrics

PGA is a **family** of algebras. Changing e₀² from 0 (euclidean) to 1 (elliptic/spherical) or −1 (hyperbolic) gives the other classical metric geometries. Many formulas and constructions (including rigid body mechanics) are **metric-neutral** and work unchanged.

---

## 11.3 The Universality of PGA

Existing approaches to euclidean geometry are largely **subsets** of PGA:

### 11.3.1 Vector Algebra

Restrict PGA to the vector space of n-vectors ⋀ⁿ:
- Euclidean n-vectors = points (P² ≠ 0)
- Ideal n-vectors = vectors (P² = 0)

All rules of vector algebra follow from the vector space structure + PGA norms. The absence of the geometric product explains why VLAAG is so much "smaller" than PGA.

Geometric intuition: vectors make up the ideal plane **bounding** the euclidean space of points — a unified topological space (≈ RPⁿ).

The pattern "adding a vector translates a point" extends: adding an ideal line translates a line, adding an ideal plane translates a plane.

### 11.3.2 Linear Algebra and Analytic Geometry

PGA is fully compatible with linear algebra. A linear map on 1-vectors induces linear maps on every grade. The difference: linear algebra is no longer needed for euclidean motions — a role it's not well-suited for.

The paper envisions a more powerful "analytic geometry" built on the full PGA, of which traditional analytic geometry is a small subset.

### 11.3.3 Exterior Algebra

The graded structure of PGA inherits from exterior algebra. The wedge product = highest-grade part of the geometric product = the meet operator. The join operator is available via Poincaré duality from the dual exterior algebra.

### 11.3.4 Quaternions and Dual Quaternions

Quaternion and dual quaternion algebras are **isomorphically embedded** in the even sub-algebra P(R\*⁺_{n,0,1}) for n ≥ 3.

**Advantages of the PGA embedding:**

- Quaternions/DQs only model **direct** isometries; PGA reveals them as even compositions of reflections (1-vector sandwiches)
- PGA has native representations for points and planes (all grades) — DQs have separate ad hoc representations and slightly different sandwich forms for each
- The mysterious dual unit ε (ε² = 0) in DQs maps cleanly to the PGA pseudoscalar I

**Historical note:** Clifford invented both dual quaternions ("biquaternions") and geometric algebra. Their reunion in PGA was likely missed due to his early death at 34 — at the time, neither the dual exterior algebra construction nor degenerate metrics had been applied to geometric algebras.

---

*The paper concludes that PGA is ready to use: homogeneous coordinates familiar to graphics programmers, a JavaScript implementation available, and cheat sheets included for both 2D and 3D.*
