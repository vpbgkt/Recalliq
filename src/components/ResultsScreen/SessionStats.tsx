/**
 * SessionStats — 4-stat grid showing score, accuracy, streak, and time.
 * Task 19
 */

import styles from './ResultsScreen.module.css';

interface SessionStatsProps {
  score: number;          // 0–10
  accuracy: number;       // 0–100
  maxStreak: number;
  completionTime: number; // milliseconds
}

/**
 * Format milliseconds as "Xm Ys" or just "Xs" when under one minute.
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

export function SessionStats({
  score,
  accuracy,
  maxStreak,
  completionTime,
}: SessionStatsProps) {
  return (
    <div className={styles.statsGrid} role="list" aria-label="Session statistics">
      <div className={styles.statCard} role="listitem">
        <span className={styles.statValue}>{score} / 10</span>
        <span className={styles.statLabel}>Score</span>
      </div>

      <div className={styles.statCard} role="listitem">
        <span className={styles.statValue}>{accuracy.toFixed(1)}%</span>
        <span className={styles.statLabel}>Accuracy</span>
      </div>

      <div className={styles.statCard} role="listitem">
        <span className={styles.statValue}>{maxStreak}</span>
        <span className={styles.statLabel}>Best Streak</span>
      </div>

      <div className={styles.statCard} role="listitem">
        <span className={styles.statValue}>{formatTime(completionTime)}</span>
        <span className={styles.statLabel}>Time</span>
      </div>
    </div>
  );
}
