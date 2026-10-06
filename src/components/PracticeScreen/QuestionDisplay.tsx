/**
 * QuestionDisplay — Task 15
 * Renders the question text with clean maths typography.
 * Requirements: 3.1, 12.5
 */

import type { Question } from '../../types';
import styles from './PracticeScreen.module.css';

interface QuestionDisplayProps {
  question: Question;
  /** 1-based question number for display */
  questionNumber: number;
}

/**
 * Returns true when the string contains maths-specific Unicode characters
 * (superscripts, √, fractions, operators, etc.) that benefit from monospace.
 */
function hasMathChars(text: string): boolean {
  return /[²³¹⁴⁵⁶⁷⁸⁹⁰√π∞∑∏∫±×÷≤≥≠≈⅛⅜⅝⅞½⅓⅔¼¾]/.test(text);
}

export function QuestionDisplay({ question, questionNumber: _questionNumber }: QuestionDisplayProps) {
  const isMath = hasMathChars(question.questionText);

  return (
    <div className={styles.questionCard}>
      <p
        className={isMath ? `${styles.questionText} ${styles.mathText}` : styles.questionText}
        role="heading"
        aria-level={2}
      >
        {question.questionText}
      </p>
    </div>
  );
}
