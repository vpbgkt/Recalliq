# Math Content Review — RecallIQ questions.json (all 140 questions)

Questions reviewed: fp-001–fp-015, sq-001–sq-020, cb-001–cb-015, sr-001–sr-015, cr-001–cr-012, df-001–df-018, rp-001–rp-020, fr-001–fr-025 (140 total).

All four checks applied to every question:
1. WRONG_ANSWER — correctAnswerIndex points to the wrong choice
2. DUPLICATE_CORRECT — another choice is mathematically equivalent to the marked answer
3. BAD_TAG — topicTags missing, empty, or mismatched
4. AMBIGUOUS_WORDING — vague phrasing, undefined rounding, or symbol rendering issues

**Verdict**: NEEDS_CHANGES — 6 confirmed issues across 2 chapters require fixes before this content is shipped.

## High-level view

The arithmetic chapters (fractions-percentages, squares, cubes, square-roots, cube-roots, ratios-percentages) are clean: every correct answer index is right, no duplicate-correct distractors, and topic tags are appropriately assigned.

The decimal-fraction chapter has three questions (df-004, df-005, df-007) where an unsimplified form of the correct answer appears as a distractor. Because the question explicitly asks for "simplest form," the unsimplified choice is wrong by definition — but it is nonetheless equal in value to the correct answer, making it a DUPLICATE_CORRECT. A student who does not simplify but recognises the value will pick the wrong indexed answer and be marked incorrect, which is a content-quality defect.

The formula-recall chapter has three issues. The circumference question (fr-002) includes πd as a distractor — since d = 2r, this is algebraically equivalent to 2πr and also correct. Two formula questions (fr-012, fr-014) use choice text where the radicand is not explicitly grouped, creating a valid alternative parse that gives the wrong formula. These are AMBIGUOUS_WORDING issues for the rendered string, not the underlying math.

<details>
<summary>Issues (6)</summary>

1. **df-004 DUPLICATE_CORRECT** — Choice "2/10" (index 3) equals 1/5 in lowest terms; the question asks for simplest form so only "1/5" should appear. Remove or replace "2/10" with a distinct wrong answer (e.g., "1/6").
2. **df-005 DUPLICATE_CORRECT** — Choice "6/10" (index 2) equals 3/5 in lowest terms; same problem as df-004. Replace with a distinct distractor (e.g., "2/3").
3. **df-007 DUPLICATE_CORRECT** — Choice "4/10" (index 3) equals 2/5 in lowest terms. Replace with a distinct distractor (e.g., "1/3").
4. **fr-002 DUPLICATE_CORRECT** — Choice "πd" (index 3) is equal to 2πr (d = 2r), making it a second correct answer for circumference. Replace "πd" with a genuinely wrong distractor (e.g., "πr²" or "πr/2").
5. **fr-012 AMBIGUOUS_WORDING** — Choice text "√(x₂ - x₁)² + (y₂ - y₁)²" is missing an outer bracket around the full radicand. It can be parsed as |x₂−x₁| + (y₂−y₁)², which is not the distance formula. Rewrite as "√[(x₂ - x₁)² + (y₂ - y₁)²]".
6. **fr-014 AMBIGUOUS_WORDING** — Choice text "x = (-b ± √b² - 4ac)/2a" has the same radicand-grouping gap; "√b² - 4ac" reads as |b| − 4ac. Rewrite as "x = (-b ± √(b² - 4ac))/2a".

</details>

<details>
<summary>Details</summary>

## Unsimplified distractors in decimal-fraction (DUPLICATE_CORRECT)

Three questions in this chapter include an unsimplified fraction as one of the four choices, while the correct answer is the fully simplified form of the same value. The question stem says "in simplest form," so the unsimplified choice is logically wrong — yet it represents the same rational number:

- **df-004** (0.2 → 1/5): choice "2/10" = 1/5. A student who writes 2/10 without simplifying would recognise the value but pick index 3, get marked wrong.
- **df-005** (0.6 → 3/5): choice "6/10" = 3/5.
- **df-007** (0.4 → 2/5): choice "4/10" = 2/5.

In each case the fix is to replace the unsimplified distractor with a fraction that is both reduced and numerically distinct from the correct answer.

## πd as a second correct circumference formula (DUPLICATE_CORRECT — fr-002)

The circumference of a circle is 2πr. The choice list for fr-002 includes both "2πr" (marked correct, index 1) and "πd" (index 3). Since d = 2r, πd = 2πr exactly — these are the same formula written in terms of different but equivalent variables. A student who recalls the diameter form will select index 3 and be marked wrong despite being correct. Replace "πd" with a distractor that is genuinely wrong (e.g., "πr/2").

## Radicand grouping gaps in formula choices (AMBIGUOUS_WORDING — fr-012, fr-014)

Both the distance formula and the quadratic formula choices omit explicit brackets around the full radicand in the correct-answer choice:

- fr-012 correct choice: `√(x₂ - x₁)² + (y₂ - y₁)²`  
  Unambiguous intent: `√[(x₂ - x₁)² + (y₂ - y₁)²]`  
  As written, standard operator-precedence rules apply the square root only to `(x₂ - x₁)²`, leaving `+ (y₂ - y₁)²` outside.

- fr-014 correct choice: `x = (-b ± √b² - 4ac)/2a`  
  Unambiguous intent: `x = (-b ± √(b² - 4ac))/2a`  
  As written, `√b²` evaluates to |b|, and `- 4ac` falls outside the radical.

Neither issue affects the stored correctAnswerIndex — the intended formula is correct — but a student carefully reading the choice text could reject the correct answer on typographical grounds, or accept a wrong answer that happens to look cleaner. Add explicit parentheses or brackets around each radicand.

</details>

---

<details>
<summary>File map</summary>

- `public/data/questions.json` — sole source reviewed; contains all 140 questions across 8 chapters.

Full diff: not applicable (static content review, no PR diff).

</details>

---

## Summary count by problem type

| Problem type        | Count | Affected questions              |
|---------------------|-------|---------------------------------|
| WRONG_ANSWER        | 0     | —                               |
| DUPLICATE_CORRECT   | 4     | df-004, df-005, df-007, fr-002  |
| BAD_TAG             | 0     | —                               |
| AMBIGUOUS_WORDING   | 2     | fr-012, fr-014                  |
| **Total**           | **6** |                                 |

## Chapters with zero issues

fractions-percentages, squares, cubes, square-roots, cube-roots, ratios-percentages — all clean.
