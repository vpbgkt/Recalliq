/**
 * AnswerChoices — Task 16
 * Renders multiple-choice answer buttons in an accessible list.
 * Requirements: 3.1, 3.2, 3.3, 3.4, 12.1–12.4
 */

import styles from './PracticeScreen.module.css';

interface AnswerChoicesProps {
  choices: string[];
  onAnswer: (index: number) => void;
  /** Disable all buttons briefly after selection to prevent double-click */
  disabled?: boolean;
}

export function AnswerChoices({ choices, onAnswer, disabled = false }: AnswerChoicesProps) {
  return (
    <ul className={styles.choicesList} role="listbox" aria-label="Answer choices">
      {choices.map((choice, index) => (
        <li key={index} role="option" aria-selected={false}>
          <button
            type="button"
            className={styles.choiceButton}
            onClick={() => onAnswer(index)}
            disabled={disabled}
            aria-label={`Choice ${String.fromCharCode(65 + index)}: ${choice}`}
          >
            <span aria-hidden="true">{String.fromCharCode(65 + index)}. </span>
            {choice}
          </button>
        </li>
      ))}
    </ul>
  );
}
