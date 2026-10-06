/**
 * ChapterCard — displays a single mathematics chapter as a clickable button.
 * Task 11.1
 */

import type { Chapter } from '../../types';
import styles from './HomeScreen.module.css';

interface ChapterCardProps {
  chapter: Chapter;
  onSelect: () => void;
}

export function ChapterCard({ chapter, onSelect }: ChapterCardProps) {
  return (
    <button
      type="button"
      className={styles.chapterCard}
      aria-label={chapter.name}
      onClick={onSelect}
    >
      <h2 className={styles.cardTitle}>{chapter.name}</h2>
      <p className={styles.cardDesc}>{chapter.description}</p>
      <span className={styles.cardCount}>
        {chapter.questionCount} question{chapter.questionCount !== 1 ? 's' : ''}
      </span>
    </button>
  );
}
