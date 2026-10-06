/**
 * ResultsScreen — shows session stats, incorrect questions, weak areas, and a
 * "Back to Home" button after a practice session is completed.
 * Tasks 18, 22
 */

import { useAppContext } from '../../context/AppContext';
import { SessionStats } from './SessionStats';
import { IncorrectQuestions } from './IncorrectQuestions';
import { WeakAreasDisplay } from './WeakAreasDisplay';
import styles from './ResultsScreen.module.css';

export function ResultsScreen() {
  const { results, returnToHome } = useAppContext();

  // Guard: nothing to show while results are absent
  if (!results) {
    return null;
  }

  return (
    <main className={styles.resultsScreen}>
      <h1>Your Results</h1>

      {/* Task 19 — 4-stat grid */}
      <SessionStats
        score={results.score}
        accuracy={results.accuracy}
        maxStreak={results.maxStreak}
        completionTime={results.completionTime}
      />

      {/* Task 20 — incorrect question review */}
      <IncorrectQuestions incorrectQuestions={results.incorrectQuestions} />

      {/* Task 21 — weak area badges */}
      <WeakAreasDisplay weakAreas={results.weakAreas} />

      {/* Tasks 22 — return to home (aria-label per spec) */}
      <button
        type="button"
        className={styles.backBtn}
        aria-label="Return to home screen"
        onClick={returnToHome}
      >
        Back to Home
      </button>
    </main>
  );
}
