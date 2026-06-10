# 9. Automatic Differentiation

> PDF page 47

PGA contains the **dual numbers** as a sub-algebra: elements of the form s + pI where 1² = 1 and **I² = 0**.

Eduard Study (inventor of dual numbers) realized they enable **automatic differentiation** — computing exact derivatives alongside function values with no numerical error.

## How it works

Start with monomials pₖ(x) = xᵏ. Extend to dual numbers:

```
pₖ(x + yI) := (x + yI)ᵏ = xᵏ + k·xᵏ⁻¹·y·I
```

All higher powers vanish because I² = 0. With y = 1:

```
pₖ(x + I) = pₖ(x) + ṗₖ(x)·I
```

**The scalar part = the function value. The I-coefficient = the exact derivative.**

For any analytic function u with derivative u̇:

```
pₖ(u + u̇I) = pₖ(u) + ṗₖ(u)·I
```

Extend to polynomials by additivity, then to all analytic functions (polynomials are dense in analytic functions).

## Multivariable case

For n variables, instead of I, use the ideal n-vectors Eᵢ (which also square to 0) as the nilpotent elements. Each Eᵢ tracks the partial derivative w.r.t. one variable.

## Practical demo

A live JavaScript implementation exists at [Ken17a] (Steven De Keninck's ganja.js).

---

*This is just a taste — full "geometric calculus" integrates calculus and differential geometry into geometric algebra, going far beyond automatic differentiation.*
