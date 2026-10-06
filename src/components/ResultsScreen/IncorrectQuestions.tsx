/**
 * IncorrectQuestions — list of incorrectly answered questions with review info.
 * Task 20
 */

import type { Question } from '../../types';
import styles from './ResultsScreen.module.css';

interface IncorrectQuestionsProps {
  incorrectQuestions: Array<{
    question: Question;
    userAnswer: number;    // index into choices
    correctAnswer: number; // index into choices
  }>;
}

export function IncorrectQuestions({ incorrectQuestions }: IncorrectQuestionsProps) {
  // Perfect score — no mistakes
  if (incorrectQuestions.length === 0) {
    return (
      <div className={styles.section}>
        <p className={styles.perfectMessage}>
          🎉 Perfect score! No mistakes.
        </p>
      </div>
    );
  }

  return (
    <section className={styles.section} aria-label="Review incorrect answers">
      <h2>Review Incorrect Answers</h2>
      <ol aria-label="Incorrect questions list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {incorrectQuestions.map(({ question, userAnswer, correctAnswer }) => (
          <li key={question.id} className={styles.incorrectItem}>
            <p>{question.questionText}</p>
            <p className={styles.wrongAnswer}>
              Your answer: {question.choices[userAnswer]}
            </p>
            <p className={styles.correctAnswer}>
              Correct answer: {question.choices[correctAnswer]}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
