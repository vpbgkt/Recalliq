# RecallIQ
## Competitive Maths Memory Trainer

**Remember faster. Recall under pressure.**

## 1. What is RecallIQ?

RecallIQ is a local-first mathematics memory-training game for competitive- and government-exam aspirants. It helps learners rapidly recall important values, conversions, roots, squares, cubes, ratios, and formulas through short practice sessions.

## 2. Why it exists

In a timed exam, students may know how to solve a problem but lose valuable time recalling frequently used mathematical values and formulas. RecallIQ gives them a focused way to practise that recall.

## 3. Features

- Eight mathematical chapters and a Mixed Challenge
- Ten-question practice sessions
- Timed practice, with elapsed completion time recorded
- Session score, accuracy, streak, and completion time
- Review of incorrectly answered questions
- Weak-area identification using question topic tags
- Progress saved locally in browser storage
- Responsive interface
- A local question bank of 140 questions
- No account, backend, or external AI API required

## 4. Chapters

1. Fractions & Percentages
2. Squares
3. Cubes
4. Square Roots
5. Cube Roots
6. Decimal & Fraction Conversions
7. Ratios & Percentages
8. Formula Recall

## 5. How to run

Install dependencies, then start the development server:

```bash
npm install
npm run dev
```

Run the tests and production build:

```bash
npm test
npm run build
```

## 6. Tech stack

- React and TypeScript
- Vite
- Vitest and fast-check
- Local JSON chapter and question data
- Browser `localStorage` for progress persistence

## 7. Kiro University

| Lesson | Demonstration in RecallIQ |
| --- | --- |
| Spec-driven development | MVP and property-based testing specifications in `.kiro/specs/` |
| Steering documents | Product direction and project guidance in `.kiro/steering/` |
| Hooks | A post-save hook runs the existing test suite when chapter or question JSON changes |
| Property-based testing | Seven fast-check properties in `src/properties.test.ts`, covering arithmetic identities and data invariants |
| Powers | The `competitive-math-content` Power provides reusable mathematics content guidance |
| MCP | A local stdio server provides `list_topics`, `get_question`, and `validate_question` |
| Custom agents | `math-content-reviewer` and `game-qa-reviewer` provide focused review guidance |

## 8. Project structure

```text
.kiro/
  agents/
  hooks/
  powers/
  settings/
  specs/
  steering/
mcp/
  math-content-server/
src/
  components/
  services/
  properties.test.ts
public/
  data/
    chapters.json
    questions.json
```
