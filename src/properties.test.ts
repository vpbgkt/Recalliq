import fc from 'fast-check';
import type { Question } from './types';

const square = (n: number): number => n * n;
const cube   = (n: number): number => n * n * n;

describe('RecallIQ properties', () => {
  /**
   * Property 1: Fraction-to-percentage mathematical equivalence
   * Validates: Requirements 2.1
   */
  it('fraction-to-percentage is mathematically equivalent', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (numerator, denominator) => {
          const a = (numerator / denominator) * 100;
          const b = (numerator * 100) / denominator;
          // Use a tolerance scaled to the maximum possible result magnitude.
          // numerator ≤ 100 and denominator ≥ 1, so the result can reach up to
          // 10 000. Number.EPSILON * 10 000 comfortably covers the worst-case
          // IEEE 754 rounding difference between the two expression orderings.
          const tolerance = Number.EPSILON * 10_000;
          return Math.abs(a - b) <= tolerance;
        }
      )
    );
  });

  /**
   * Property 2: square(n) identity
   * Validates: Requirements 3.1
   */
  it('square(n) equals n * n', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 30 }),
        (n) => square(n) === n * n
      )
    );
  });

  /**
   * Property 3: cube(n) identity
   * Validates: Requirements 4.1
   */
  it('cube(n) equals n * n * n', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        (n) => cube(n) === n * n * n
      )
    );
  });

  /**
   * Property 4: sqrt-of-square round trip
   * Validates: Requirements 5.1
   */
  it('Math.round(Math.sqrt(n * n)) equals n for non-negative integers', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 30 }),
        (n) => Math.round(Math.sqrt(n * n)) === n
      )
    );
  });

  /**
   * Property 5: Score range invariant
   * Validates: Requirements 6.1
   */
  it('score is always in [0, 10]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        (score) => score >= 0 && score <= 10
      )
    );
  });

  /**
   * Property 6: Accuracy range invariant
   * Validates: Requirements 7.1
   */
  it('accuracy derived from score is always in [0, 100]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        (score) => {
          const accuracy = (score / 10) * 100;
          return accuracy >= 0 && accuracy <= 100;
        }
      )
    );
  });

  /**
   * Property 7: Question correctAnswerIndex in bounds
   * Validates: Requirements 8.1
   */
  it('correctAnswerIndex is always a valid index into choices', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 6 }).chain((choicesCount) =>
          fc.integer({ min: 0, max: choicesCount - 1 }).map((correctAnswerIndex) => ({
            choicesCount,
            correctAnswerIndex,
          }))
        ),
        ({ choicesCount, correctAnswerIndex }) => {
          const q: Pick<Question, 'choices' | 'correctAnswerIndex'> = {
            choices: Array(choicesCount).fill('x') as string[],
            correctAnswerIndex,
          };
          return q.correctAnswerIndex >= 0 && q.correctAnswerIndex < q.choices.length;
        }
      )
    );
  });
});
