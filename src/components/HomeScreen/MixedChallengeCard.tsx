/**
 * MixedChallengeCard — the 9th option on the home screen.
 * Visually distinct from chapter cards via the `mixedChallengeCard` CSS class.
 * Task 11.2
 */

import styles from './HomeScreen.module.css';

interface MixedChallengeCardProps {
  onSelect: () => void;
}

export function MixedChallengeCard({ onSelect }: MixedChallengeCardProps) {
  return (
    <button
      type="button"
      className={styles.mixedChallengeCard}
      aria-label="Start Mixed Challenge"
      onClick={onSelect}
    >
      <h2 className={styles.cardTitle}>Mixed Challenge</h2>
      <p className={styles.cardDesc}>
        10 questions from all chapters — test your full knowledge
      </p>
    </button>
  );
}
