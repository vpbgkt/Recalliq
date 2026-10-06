/**
 * HomeScreen — landing screen listing the 8 chapter cards and
 * the distinct Mixed Challenge card as a 9th option.
 * Task 10
 */

import { useAppContext } from '../../context/AppContext';
import { ChapterCard } from './ChapterCard';
import { MixedChallengeCard } from './MixedChallengeCard';
import styles from './HomeScreen.module.css';

export function HomeScreen() {
  const {
    chapters,
    startSession,
    startMixedChallenge,
    isLoading,
    error,
  } = useAppContext();

  if (isLoading) {
    return (
      <main className={styles.homeScreen}>
        <div className={styles.loading} role="status" aria-live="polite">
          <span className={styles.spinner} aria-hidden="true" />
          Loading chapters…
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.homeScreen}>
        <div className={styles.error} role="alert">
          <strong>Failed to load</strong>
          <span>{error}</span>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.homeScreen}>
      {/* Header */}
      <header className={styles.header}>
        <h1>RecallIQ</h1>
        <p className={styles.subtitle}>
          Master competitive-exam mathematics — one chapter at a time
        </p>
      </header>

      {/* 8 chapter cards in a responsive grid */}
      <section aria-label="Chapter selection">
        <div className={styles.chaptersGrid}>
          {chapters.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              onSelect={() => { startSession(chapter.id); }}
            />
          ))}
        </div>
      </section>

      {/* Mixed Challenge — 9th distinct option below the grid */}
      <section
        className={styles.mixedChallengeSection}
        aria-label="Mixed challenge"
      >
        <MixedChallengeCard onSelect={startMixedChallenge} />
      </section>
    </main>
  );
}
