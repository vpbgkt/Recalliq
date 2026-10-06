/**
 * PracticeScreen — Task 13
 * Top-level screen for an active practice session.
 * Composes SessionProgress, QuestionDisplay, and AnswerChoices.
 * Requirements: 2.3, 3.1–3.4, 12.1–12.5
 */

import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { SessionProgress } from './SessionProgress';
import { QuestionDisplay } from './QuestionDisplay';
import { AnswerChoices } from './AnswerChoices';
import styles from './PracticeScreen.module.css';

export function PracticeScreen() {
  const { session, chapters, answerQuestion } = useAppContext();

  // Briefly disable answer buttons after a selection to prevent double-click
  const [answering, setAnswering] = useState(false);

  // Guard: parent handles routing — render nothing when no session is active
  if (!session) return null;

  const currentQuestion = session.questions[session.currentQuestionIndex];

  // Resolve the chapter name for the header label
  const chapterLabel =
    session.chapterId === null
      ? 'Mixed Challenge'
      : (chapters.find((c) => c.id === session.chapterId)?.name ?? 'Practice');

  function handleAnswer(index: number) {
    if (answering) return;
    setAnswering(true);
    answerQuestion(index);
    // Re-enable after a short debounce; the context will advance the question
    setTimeout(() => setAnswering(false), 300);
  }

  return (
    <main className={styles.practiceScreen} aria-label="Practice session">
      {/* Header: chapter label + progress */}
      <div className={styles.header}>
        <span className={styles.chapterLabel}>{chapterLabel}</span>
        <SessionProgress
          currentIndex={session.currentQuestionIndex}
          total={session.questions.length}
          streak={session.streak}
        />
      </div>

      {/* Question */}
      <QuestionDisplay
        question={currentQuestion}
        questionNumber={session.currentQuestionIndex + 1}
      />

      {/* Answer choices */}
      <AnswerChoices
        choices={currentQuestion.choices}
        onAnswer={handleAnswer}
        disabled={answering}
      />
    </main>
  );
}
