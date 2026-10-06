/**
 * AppContext — React Context structure, ApplicationProvider, and all session actions.
 *
 * Tasks 4–9 of the RecallIQ MVP spec:
 *   4  Context structure (AppContextValue, AppContext, useAppContext)
 *   5  ApplicationProvider foundation (state + data-loading useEffect)
 *   6  startSession / startMixedChallenge
 *   7  answerQuestion
 *   8  completeSession
 *   9  returnToHome
 */

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import type {
  Chapter,
  Question,
  UserAnswer,
  PracticeSession,
  SessionResults,
  ProgressData,
} from '../types';

import { loadChaptersData, loadQuestionsData } from '../services/dataLoader';
import {
  selectQuestionsForChapter,
  selectMixedQuestions,
} from '../services/questionSelector';
import {
  loadProgressFromStorage,
  saveProgressToStorage,
} from '../services/storageService';
import { generateId } from '../utils/helpers';

// ---------------------------------------------------------------------------
// Task 4 — Context structure
// ---------------------------------------------------------------------------

/**
 * The full shape of everything the context exposes to consumers.
 */
interface AppContextValue {
  // ── Data ──────────────────────────────────────────────────────────────────
  chapters: Chapter[];
  questions: Question[];
  session: PracticeSession | null;
  results: SessionResults | null;
  progress: ProgressData;

  // ── Screen routing ────────────────────────────────────────────────────────
  currentScreen: 'home' | 'practice' | 'results';

  // ── Async status ─────────────────────────────────────────────────────────
  isLoading: boolean;
  error: string | null;

  // ── Actions ───────────────────────────────────────────────────────────────
  startSession: (chapterId: string) => void;
  startMixedChallenge: () => void;
  answerQuestion: (answerIndex: number) => void;
  returnToHome: () => void;
}

/**
 * The raw context object. Typed as `AppContextValue | undefined` so that the
 * `useAppContext` hook can detect misuse (called outside a provider).
 */
const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * Custom hook that gives components access to the context.
 * Throws a clear error when used outside `<ApplicationProvider>`.
 */
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within ApplicationProvider');
  }
  return context;
}

// ---------------------------------------------------------------------------
// Task 5 — ApplicationProvider foundation
// ---------------------------------------------------------------------------

interface ApplicationProviderProps {
  children: ReactNode;
}

/**
 * Wraps the application and owns all global state.
 * Loads chapters, questions, and stored progress on first mount.
 */
export function ApplicationProvider({ children }: ApplicationProviderProps) {
  // ── State variables (Task 5) ──────────────────────────────────────────────
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [results, setResults] = useState<SessionResults | null>(null);
  const [progress, setProgress] = useState<ProgressData>({
    sessionHistory: [],
    topicPerformance: {},
  });
  const [currentScreen, setCurrentScreen] = useState<
    'home' | 'practice' | 'results'
  >('home');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Mount effect: load all data (Task 5) ─────────────────────────────────
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const [loadedChapters, loadedQuestions] = await Promise.all([
          loadChaptersData(),
          loadQuestionsData(),
        ]);

        setChapters(loadedChapters);
        setQuestions(loadedQuestions);

        // loadProgressFromStorage is synchronous — call after async work
        const storedProgress = loadProgressFromStorage();
        setProgress(storedProgress);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load application data';
        setError(message);
        console.error('ApplicationProvider: data load error:', message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, []);

  // ---------------------------------------------------------------------------
  // Task 6 — Session start actions
  // ---------------------------------------------------------------------------

  /**
   * Start a chapter-specific practice session.
   * Selects 10 random questions from `chapterId` via `selectQuestionsForChapter`.
   */
  function startSession(chapterId: string): void {
    const sessionQuestions = selectQuestionsForChapter(chapterId, questions);

    const newSession: PracticeSession = {
      sessionId: generateId(),
      chapterId,
      questions: sessionQuestions,
      userAnswers: [],
      currentQuestionIndex: 0,
      streak: 0,
      maxStreak: 0,
      startTime: Date.now(),
      endTime: null,
    };

    setSession(newSession);
    setCurrentScreen('practice');
  }

  /**
   * Start a Mixed Challenge session.
   * Selects 10 questions from at least 2 different chapters.
   * chapterId is null to distinguish it from chapter-specific sessions.
   */
  function startMixedChallenge(): void {
    const sessionQuestions = selectMixedQuestions(questions);

    const newSession: PracticeSession = {
      sessionId: generateId(),
      chapterId: null,
      questions: sessionQuestions,
      userAnswers: [],
      currentQuestionIndex: 0,
      streak: 0,
      maxStreak: 0,
      startTime: Date.now(),
      endTime: null,
    };

    setSession(newSession);
    setCurrentScreen('practice');
  }

  // ---------------------------------------------------------------------------
  // Task 8 — completeSession (declared before answerQuestion so it can be called)
  // ---------------------------------------------------------------------------

  /**
   * Called once the user has answered all 10 questions.
   * Calculates score, accuracy, completion time, incorrect questions, and
   * weak areas, then persists to storage and transitions to the results screen.
   */
  function completeSession(completedSession: PracticeSession): void {
    const endTime = Date.now();
    const completionTime = endTime - completedSession.startTime;

    // Score = number of correct answers
    const score = completedSession.userAnswers.filter((a) => a.isCorrect).length;

    // Accuracy = (score / 10) * 100
    const accuracy = (score / completedSession.questions.length) * 100;

    // Build the incorrectQuestions array — pair each answer with its question
    const incorrectQuestions = completedSession.userAnswers
      .map((answer, index) => ({
        answer,
        question: completedSession.questions[index],
      }))
      .filter(({ answer }) => !answer.isCorrect)
      .map(({ answer, question }) => ({
        question,
        userAnswer: answer.selectedAnswerIndex,
        correctAnswer: question.correctAnswerIndex,
      }));

    // Derive weak areas: unique topic tags from all incorrect questions
    const weakAreas = [
      ...new Set(incorrectQuestions.flatMap((iq) => iq.question.topicTags)),
    ];

    const sessionResults: SessionResults = {
      sessionId: completedSession.sessionId,
      chapterId: completedSession.chapterId,
      score,
      accuracy,
      maxStreak: completedSession.maxStreak,
      completionTime,
      incorrectQuestions,
      weakAreas,
    };

    // Persist to local storage — pass full questions array for complete topic tracking
    try {
      const updatedProgress = saveProgressToStorage(
        progress,
        sessionResults,
        chapters,
        completedSession.questions, // full session questions for complete tracking
      );
      setProgress(updatedProgress);
    } catch (storageErr) {
      // Storage failure is non-fatal — results still shown to user
      const message =
        storageErr instanceof Error
          ? storageErr.message
          : 'Failed to save progress';
      console.error('ApplicationProvider: storage error:', message);
    }

    setResults(sessionResults);
    setCurrentScreen('results');
    setSession(null);
  }

  // ---------------------------------------------------------------------------
  // Task 7 — answerQuestion action
  // ---------------------------------------------------------------------------

  /**
   * Record the user's answer for the current question, update streak and
   * maxStreak, advance the question index, and complete the session when
   * all 10 answers have been collected.
   */
  function answerQuestion(answerIndex: number): void {
    if (!session) return;

    const currentQuestion = session.questions[session.currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswerIndex;

    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedAnswerIndex: answerIndex,
      isCorrect,
      timestamp: Date.now(),
    };

    // Streak: +1 on correct, SET to 0 on incorrect (never decrement below 0)
    const newStreak = isCorrect ? session.streak + 1 : 0;
    const newMaxStreak = Math.max(session.maxStreak, newStreak);

    const updatedSession: PracticeSession = {
      ...session,
      userAnswers: [...session.userAnswers, userAnswer],
      currentQuestionIndex: session.currentQuestionIndex + 1,
      streak: newStreak,
      maxStreak: newMaxStreak,
    };

    // 10 answers collected → session is over
    if (updatedSession.userAnswers.length >= updatedSession.questions.length) {
      completeSession(updatedSession);
    } else {
      setSession(updatedSession);
    }
  }

  // ---------------------------------------------------------------------------
  // Task 9 — returnToHome action
  // ---------------------------------------------------------------------------

  /**
   * Clear session and results state, return to the home screen.
   * Requirement 13.3: practice session state is reset.
   */
  function returnToHome(): void {
    setSession(null);
    setResults(null);
    setCurrentScreen('home');
  }

  // ---------------------------------------------------------------------------
  // Provide the context value
  // ---------------------------------------------------------------------------

  const value: AppContextValue = {
    chapters,
    questions,
    session,
    results,
    progress,
    currentScreen,
    isLoading,
    error,
    startSession,
    startMixedChallenge,
    answerQuestion,
    returnToHome,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
