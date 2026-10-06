/**
 * SessionProgress — Task 14
 * Shows question counter, progress bar, and streak badge.
 * Requirements: 2.3, 3.5, 3.6
 */

import styles from './PracticeScreen.module.css';

interface SessionProgressProps {
  /** 0-based index of the current question */
  currentIndex: number;
  /** Total number of questions, always 10 */
  total: number;
  /** Current answer streak */
  streak: number;
}

export function SessionProgress({ currentIndex, total, streak }: SessionProgressProps) {
  const questionNumber = currentIndex + 1; // 1-based display
  const fillPercent = (questionNumber / total) * 100;

  return (
    <div className={styles.progressInfo} role="status" aria-live="polite">
      <span className={styles.questionCounter}>
        Question {questionNumber} of {total}
      </span>

      {/* Progress bar */}
      <div
        className={styles.progressBarTrack}
        role="progressbar"
        aria-valuenow={questionNumber}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Progress: question ${questionNumber} of ${total}`}
      >
        <div
          className={styles.progressBarFill}
          style={{ width: `${fillPercent}%` }}
        />
      </div>

      {/* Streak badge — hidden (but still in DOM) when streak is 0 */}
      <span
        className={
          streak > 0
            ? styles.streakBadge
            : `${styles.streakBadge} ${styles.streakBadgeHidden}`
        }
        aria-hidden={streak === 0}
      >
        🔥 Streak: {streak}
      </span>
    </div>
  );
}
