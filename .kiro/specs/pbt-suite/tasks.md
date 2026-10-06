# Implementation Plan: PBT Suite for RecallIQ

## Overview

Wire vitest into the build config, add a `test` script to `package.json`, then write `src/properties.test.ts` with all seven `fc.assert` property tests. The only application files touched are `vite.config.ts` and `package.json`.

## Tasks

- [x] 1. Configure vitest in vite.config.ts
  - [x] 1.1 Add `test: { globals: true, environment: 'node' }` to the `defineConfig` call in `vite.config.ts`
    - Preserve the existing `plugins: [react()]` entry unchanged
    - The `test` key is read directly by Vitest when it resolves the Vite config
    - _Requirements: 1.1_

- [x] 2. Add test script to package.json
  - [x] 2.1 Insert `"test": "vitest --run"` into the `scripts` block of `package.json`
    - Place it after the existing `"lint"` entry
    - `--run` ensures a single-pass execution (no watch mode)
    - _Requirements: 1.2_

- [x] 3. Write src/properties.test.ts with all 7 properties
  - [x] 3.1 Create `src/properties.test.ts` and implement Property 1 — fraction-to-percentage equivalence
    - Import `fc` from `fast-check`
    - Use `fc.integer({ min: 0, max: 100 })` for numerator and `fc.integer({ min: 1, max: 100 })` for denominator
    - Assert `(numerator / denominator) * 100 === (numerator * 100) / denominator`
    - **Property 1: Fraction-to-percentage mathematical equivalence**
    - **Validates: Requirements 2.1**
    - _Requirements: 2.1_

  - [x] 3.2 Add Property 2 — square(n) identity
    - Define inline `const square = (n: number) => n * n`
    - Use `fc.integer({ min: 1, max: 30 })`
    - Assert `square(n) === n * n`
    - **Property 2: square(n) identity**
    - **Validates: Requirements 3.1**
    - _Requirements: 3.1_

  - [x] 3.3 Add Property 3 — cube(n) identity
    - Define inline `const cube = (n: number) => n * n * n`
    - Use `fc.integer({ min: 1, max: 20 })`
    - Assert `cube(n) === n * n * n`
    - **Property 3: cube(n) identity**
    - **Validates: Requirements 4.1**
    - _Requirements: 4.1_

  - [x] 3.4 Add Property 4 — sqrt-of-square round trip
    - Use `fc.integer({ min: 0, max: 30 })`
    - Assert `Math.round(Math.sqrt(n * n)) === n`
    - **Property 4: sqrt-of-square round trip**
    - **Validates: Requirements 5.1**
    - _Requirements: 5.1_

  - [x] 3.5 Add Property 5 — score range invariant
    - Use `fc.integer({ min: 0, max: 10 })`
    - Assert `score >= 0 && score <= 10`
    - **Property 5: Score range invariant**
    - **Validates: Requirements 6.1**
    - _Requirements: 6.1_

  - [x] 3.6 Add Property 6 — accuracy range invariant
    - Reuse `fc.integer({ min: 0, max: 10 })` for score
    - Compute `const accuracy = (score / 10) * 100`
    - Assert `accuracy >= 0 && accuracy <= 100`
    - **Property 6: Accuracy range invariant**
    - **Validates: Requirements 7.1**
    - _Requirements: 7.1_

  - [x] 3.7 Add Property 7 — Question correctAnswerIndex in bounds
    - Use `fc.integer({ min: 2, max: 6 })` for `choicesCount`
    - Use `fc.chain` to derive `fc.integer({ min: 0, max: choicesCount - 1 })` for `correctAnswerIndex`
    - Build a `Question`-shaped object with a `choices` array of length `choicesCount`
    - Assert `correctAnswerIndex >= 0 && correctAnswerIndex < question.choices.length`
    - Import `Question` as a type-only import from `../types`
    - **Property 7: Question correctAnswerIndex in bounds**
    - **Validates: Requirements 8.1**
    - _Requirements: 8.1_

- [x] 4. Run tests and verify
  - [x] 4.1 Run `npm test` (or `npx vitest --run`) and confirm all 7 properties pass with 0 failures
    - Fix any TypeScript compilation errors in `src/properties.test.ts` before re-running
    - Ensure the test output shows 7 passing tests
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1_

- [x] 5. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The test file must stay under 120 lines; all 7 properties fit comfortably in one `describe` block
- Do NOT modify any files under `src/components`, `src/context`, `src/services`, or `src/utils`
- `fc.chain` is the correct fast-check combinator for correlated arbitraries (Property 7)
- `globals: true` in the vitest config makes `describe`, `it`, and `expect` available without explicit imports

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["3.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "3.4", "3.5", "3.6", "3.7"] },
    { "id": 3, "tasks": ["4.1"] }
  ]
}
```
