# 7. PGA for the Euclidean Plane: P(R\*_{2,0,1})

> PDF pages 25–35

## Coordinate Setup

Using affine coordinates with an extra homogeneous dimension:

- **Point:** (x, y) → (x, y, 1)
- **Direction (ideal point):** (x, y) → (x, y, 0)

### Basis 1-vectors (lines)

| Symbol | Represents | Square |
|--------|-----------|--------|
| e₀ | ideal line ω (line at infinity) | e₀² = 0 |
| e₁ | coordinate line x = 0 | e₁² = 1 |
| e₂ | coordinate line y = 0 | e₂² = 1 |

These satisfy eᵢeⱼ = eᵢ ∧ eⱼ when i ≠ j (orthogonality).

### Basis 2-vectors (intersection points of basis lines)

| Symbol | Formula | Represents | Square |
|--------|---------|------------|--------|
| E₀ | e₁e₂ | origin (0,0) | E₀² = −1 |
| E₁ | e₂e₀ | x-direction (ideal) | E₁² = 0 |
| E₂ | e₀e₁ | y-direction (ideal) | E₂² = 0 |

**Signature on 2-vectors:** (1, 0, 2) — even more degenerate.

### Pseudoscalar

**I := e₀e₁e₂** — represents the whole plane. I² = 0.

The full 8×8 multiplication table is Table 2 in the paper.

> **Exercise:** For a 1-vector m = ae₁ + be₂ + ce₀: m² = a² + b². For a 2-vector P = xE₁ + yE₂ + zE₀: P² = −z².

---

## 7.1 Normalizing k-Vectors

The square of any k-vector is a scalar:

- **Non-zero square → euclidean** element (can be normalized to unit weight)
- **Zero square → ideal** element (needs a different norm)

### Euclidean norm

For euclidean X (X² ≠ 0):

```
X̂ := X / √|X²|
```

Then X̂² = ±1.

- Euclidean line a: normalizes to â with â² = 1
- Euclidean point P = xE₁ + yE₂ + E₀: normalizes to P̂ with P̂² = −1

### Ideal norm ‖·‖∞

For ideal elements (X² = 0), define a separate norm:

- **Ideal point** V = xE₁ + yE₂: ‖V‖∞ := √(x²+y²)
- **Ideal line** m = ce₀: ‖m‖∞ := c
- **Pseudoscalar** aI: ‖aI‖∞ = a

Ideal norms for lines and pseudoscalars are **signed** magnitudes (1-dimensional subspaces). They're called **numerical values** rather than traditional norms.

### Weight

If ‖X‖ = d, X has weight d. Normalized elements have weight 1. Computations assume normalized arguments; the weight of the result carries geometric meaning. This means we do **not** work purely projectively — weight distinguishes projectively equivalent elements.

---

## 7.2 Products of Pairs in 2D

### Multiplication by pseudoscalar I

**Polarity operator:** XI = X⊥ — the orthogonal complement with respect to the euclidean metric.

- a⊥ := aI = ideal point perpendicular to line a's direction
- P⊥ := PI = the ideal line e₀

### Product of two euclidean lines

```
ab = a·b + a∧b = ⟨ab⟩₀ + ⟨ab⟩₂
```

- **⟨ab⟩₀ = a·b = cos α** (α = oriented angle)
- **⟨ab⟩₂ = a∧b** = intersection point:
  - If lines intersect: (sin α)P where P is the normalized intersection
  - If lines are parallel: d\_{ab}P, where d\_{ab} is the distance between them

**Polymorphism!** The same formula handles intersecting and parallel lines seamlessly.

### Product of two euclidean points

```
PQ = ⟨PQ⟩₀ + ⟨PQ⟩₂ = −1 + d\_{PQ}V
```

- **⟨PQ⟩₀ = −1** — every pair of normalized euclidean points has inner product −1 (metric degeneracy on points)
- **⟨PQ⟩₂ = P×Q** = ideal point perpendicular to the joining line P∨Q

The distance between points comes from the bivector part:

```
d\_{PQ} = ‖P×Q‖∞ = ‖P∨Q‖∞ = ‖P − Q‖∞
```

### Product of euclidean point and line

```
aP = ⟨aP⟩₁ + ⟨aP⟩₃ = a·P + a∧P
    = a⊥\_P + d\_{aP}I
```

- **⟨aP⟩₁ = a·P** = the line through P perpendicular to a (written a⊥\_P)
- **⟨aP⟩₃ = a∧P** = pseudoscalar with weight d\_{aP} (euclidean distance from P to a)

Note: a·P is **anti-symmetric**: P·a = −a·P.

**Dual thinking:** In the dual algebra, points are "made of lines" — a point is the pencil of all lines through it. The inner product a·P **contracts** by removing the line through P parallel to a, leaving the orthogonal line through P.

> Formulas for all products (including ideal arguments) are collected in Table 3 of the paper. They assume normalized arguments.

---

## 7.3 Formula Factories: Three-Way Products

Using X² = ±1 for normalized euclidean elements and associativity:

```
Y = ±(XX)Y = ±X(XY)
```

This gives an **orthogonal decomposition** of Y with respect to X. Extracts: projection, rejection, nearest point, parallel-through-point, etc.

### Project line m onto line n

From m = (m·n)n + (m∧n)n:

```
m = (cos α)n + (sin α)Pn = (cos α)n − (sin α)n⊥\_P
```

- n⊥\_P is the line through intersection point P perpendicular to n
- Decomposes m into components parallel and perpendicular to n

### Project line m onto point P

From m = −(m·P)P − (m∧P)P:

```
m = −m⊥\_P·P − d\_{mP}IP = m||\_P − d\_{mP}ω
```

- m||\_P = line through P parallel to m
- Just as adding an ideal point translates a point, adding an ideal line translates a line

### Project point P onto line m

Gives P_m = the point on m closest to P, plus a vector perpendicular to m.

---

## 7.4 Isometries as Sandwich Operators

### Reflection in a line

For normalized lines a and b:

```
aba = cos(α)a + sin(α)a⊥\_P
```

Compare with the orthogonal decomposition from §7.3:

```
b = cos(α)a − sin(α)a⊥\_P
```

The sign flip on sin means **aba is the reflection of b in line a**. This is a **sandwich operator**: a on both sides. It works for any grade — aXa reflects point X in line a too.

### Rotations and translations from sandwich composition

Reflection in a followed by reflection in b:

```
R = b(aXa)b = (ba)X(ab) = RXR̃
```

- When a and b **intersect** at angle α/2: R = cos(α/2) + sin(α/2)P is a **rotator** around P by angle α
- When a and b are **parallel** separated by d: R = 1 + dV is a **translator** by 2d perpendicular to V's direction

**Polymorphism again!** The same construction yields both rotations and translations.

### Exponential form of motors

Directly from center point/angle:

```
R = e^{(α/2)P} = cos(α/2) + sin(α/2)P    (P² = −1, euclidean)
T = e^{(d/2)P} = 1 + (d/2)P              (P² = 0, ideal)
```

A **motor** is a normalized versor satisfying RR̃ = 1. It's either a rotator (euclidean fixed point) or a translator (ideal).

### Moving one line to another

Given lines l₁, l₂ intersecting at P with angle α:

- g = l₂l₁ rotates by 2α around P
- The desired motor moving l₁ to l₂ is √g̃. When g is normalized: √g̃ = (1+g)/‖1+g‖

Works for both intersecting and parallel lines.

---

**Table 3** in the paper collects ~25 2D formulas (intersection, angle, distance, projection, reflection, rotation, translation, area, etc.) — all polymorphic and compact.

---

*Next: Chapter 8 extends to 3D, where lines introduce the most interesting new structure.*
