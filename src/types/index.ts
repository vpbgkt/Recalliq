/**
 * RecallIQ Type Definitions
 * Local-first mathematics practice application
 */

/**
 * Represents a mathematical topic chapter
 */
export interface Chapter {
  id: string;
  name: string;
  description: string;
  questionCount: number;
}

/**
 * Represents a multiple-choice question with topic tags for weak area identification
 */
export interface Question {
  id: string;
  chapterId: string;
  questionText: string;
  choices: string[];
  correctAnswerIndex: number;
  topicTags: string[];
  explanation?: string;
}

/**
 * Represents a user's answer to a question
 */
export interface UserAnswer {
  questionId: string;
  selectedAnswerIndex: number;
  isCorrect: boolean;
  timestamp: number;
}

/**
 * Represents an active practice session
 */
export interface PracticeSession {
  sessionId: string;
  chapterId: string | null; // null for Mixed Challenge
  questions: Question[];
  userAnswers: UserAnswer[];
  currentQuestionIndex: number;
  streak: number;
  maxStreak: number;
  startTime: number;
  endTime: number | null;
}

/**
 * Session results after completion
 */
export interface SessionResults {
  sessionId: string;
  chapterId: string | null;
  score: number;
  accuracy: number;
  maxStreak: number;
  completionTime: number; // in milliseconds
  incorrectQuestions: Array<{
    question: Question;
    userAnswer: number;
    correctAnswer: number;
  }>;
  weakAreas: string[]; // Topic tags from incorrectly answered questions
}

/**
 * Topic performance statistics for weak area identification
 */
export interface TopicPerformance {
  [topicTag: string]: {
    attempts: number;   // Total questions attempted with this tag
    correct: number;    // Correct answers for this tag
  };
}

/**
 * Progress data stored in local storage
 */
export interface ProgressData {
  sessionHistory: Array<{
    sessionId: string;
    chapterName: string;
    score: number;
    accuracy: number;
    completionTime: number;
    timestamp: number;
  }>;
  topicPerformance: TopicPerformance; // Track attempts and correct per topic tag
}

/**
 * chapters.json structure
 */
export interface ChaptersData {
  chapters: Chapter[];
}

/**
 * questions.json structure
 */
export interface QuestionsData {
  questions: Question[];
}

