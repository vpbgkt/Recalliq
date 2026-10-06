# Design Document: PBT Suite for RecallIQ

## Overview

This feature wires `fast-check` and `vitest` into the RecallIQ project and implements seven property-based tests in a single file, `src/properties.test.ts`. No application source files are modified except `vite.config.ts` (to register the test runner) and `package.json` (to add the `test` script).

All seven tests are pure math or structural properties — no DOM, React, network, or local-storage access.

---

## Architecture

### Files Changed / Created

| File | Change |
|---|---|
| `vite.config.ts` | Add `test: { globals: true, environment: 'node' }` block |
| `package.json` | Add `"test": "vitest --run"` to `scripts` |
| `src/properties.test.ts` | New file — 7 `fc.assert` property tests |

### No New Modules

The test file imports only:
- `fast-check` (already in `devDependencies`)
- `vitest` globals (`describe`, `it`, `expect`) — available via `globals: true`
- `Question` type from `src/types/index.ts` (type-only import, erased at runtime)

---

## Component Design

### `vite.config.ts` — Test Configuration

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
  },
})
```

The `test` block is picked up by Vitest automatically when it reads `vite.config.ts`.

---

### `src/properties.test.ts` — Property Tests

The file is structured as a single `describe` block with seven `it` cases. Each case calls `fc.assert(fc.property(...))`.

**Helper functions** (inline, no exports):

```typescript
const square = (n: number): number => n * n;
const cube   = (n: number): number => n * n * n;
```

**Arbitraries used:**

| Property | Arbitraries |
|---|---|
| Fraction-to-percentage | `fc.integer({ min: 0, max: 100 })`, `fc.integer({ min: 1, max: 100 })` |
| square(n) | `fc.integer({ min: 1, max: 30 })` |
| cube(n) | `fc.integer({ min: 1, max: 20 })` |
| sqrt(square(n)) | `fc.integer({ min: 0, max: 30 })` |
| Score in [0,10] | `fc.integer({ min: 0, max: 10 })` |
| Accuracy in [0,100] | `fc.integer({ min: 0, max: 10 })` |
| Question index validity | `fc.integer({ min: 2, max: 6 })` for choices count + correlated `fc.integer` for index |

The Question property uses a two-step approach: generate `choicesCount` first, then derive `correctAnswerIndex` from it via `fc.integer({ min: 0, max: choicesCount - 1 })` inside `fc.chain`.

---

## Data Flow

```
vitest --run
  └─ reads vite.config.ts (test block)
  └─ discovers src/properties.test.ts
       └─ fc.assert(fc.property(arbitrary, predicate))
            └─ fast-check generates 100 random inputs
            └─ predicate returns boolean
            └─ vitest: expect(result).toBe(true)  [or throws on failure]
```

---

## Error Handling

- If a property fails, `fc.assert` throws with a minimal failing example (fast-check shrinks automatically).
- Vitest catches the thrown error and reports the failing test with the counterexample.
- No application state is mutated; all tests are fully isolated.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do.*

### Property 1: Fraction-to-percentage mathematical equivalence

For any integer numerator in `[0, 100]` and any positive integer denominator in `[1, 100]`, the expression `(numerator / denominator) * 100` must equal `(numerator * 100) / denominator`.

**Validates: Requirements 2.1**

---

### Property 2: square(n) identity

For any integer `n` in `[1, 30]`, the helper function `square(n)` must equal `n * n`.

**Validates: Requirements 3.1**

---

### Property 3: cube(n) identity

For any integer `n` in `[1, 20]`, the helper function `cube(n)` must equal `n * n * n`.

**Validates: Requirements 4.1**

---

### Property 4: sqrt-of-square round trip

For any non-negative integer `n` in `[0, 30]`, `Math.round(Math.sqrt(n * n))` must equal `n`.

**Validates: Requirements 5.1**

---

### Property 5: Score range invariant

For any integer score in `[0, 10]`, the score must satisfy `score >= 0 && score <= 10`.

**Validates: Requirements 6.1**

---

### Property 6: Accuracy range invariant

For any integer score in `[0, 10]`, the derived accuracy `(score / 10) * 100` must satisfy `accuracy >= 0 && accuracy <= 100`.

**Validates: Requirements 7.1**

---

### Property 7: Question correctAnswerIndex in bounds

For any `Question`-shaped object generated with `choicesCount` in `[2, 6]` and `correctAnswerIndex` in `[0, choicesCount - 1]`, the index must satisfy `correctAnswerIndex >= 0 && correctAnswerIndex < question.choices.length`.

**Validates: Requirements 8.1**
