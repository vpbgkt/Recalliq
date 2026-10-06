/**
 * WeakAreasDisplay — pill badges for topic tags identified as weak areas.
 * Task 21
 */

import styles from './ResultsScreen.module.css';

interface WeakAreasDisplayProps {
  weakAreas: string[]; // topic tags e.g. ["squares", "two-digit"]
}

/**
 * Convert a hyphen-separated tag to Title Case.
 * e.g. "two-digit" → "Two Digit"
 */
function formatTag(tag: string): string {
  return tag
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function WeakAreasDisplay({ weakAreas }: WeakAreasDisplayProps) {
  // Perfect score — nothing to show
  if (weakAreas.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-label="Weak areas">
      <h2>Weak Areas</h2>
      <div className={styles.weakAreaBadges} role="list">
        {weakAreas.map((tag) => (
          <span key={tag} className={styles.badge} role="listitem">
            {formatTag(tag)}
          </span>
        ))}
      </div>
    </section>
  );
}
