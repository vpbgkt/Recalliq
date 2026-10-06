# Technical Design Document: RecallIQ MVP

## Overview

RecallIQ is a local-first mathematics practice application built with React, TypeScript, and Vite. The application provides an offline-capable practice environment with eight mathematical topic chapters, a ninth "Mixed Challenge" option that combines questions from multiple chapters, multiple-choice questions with topic tags for weak area identification, performance tracking, and progress persistence. All data is stored locally, with question content in JSON files and user progress persisted in browser local storage.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    RecallIQ Application                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │    Home      │  │   Practice   │  │   Results   │  │
│  │   Screen     │  │    Screen    │  │   Screen    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘  │
│         │                 │                  │         │
│         └─────────────────┼──────────────────┘         │
│                           │                            │
│              ┌────────────▼──────────────┐             │
│              │   Application Context     │             │
│              │   (React Context API)     │             │
│              └────────────┬──────────────┘             │
│                           │                            │
│         ┌─────────────────┼─────────────────┐         │
│         │                 │                 │         │
│    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐    │
│    │ Session │      │Question │      │Progress │    │
│    │ Manager │      │ Loader  │      │ Tracker │    │
│    └────┬────┘      └────┬────┘      └────┬────┘    │
│         │                │                 │         │
├─────────┼────────────────┼─────────────────┼─────────┤
│         │                │                 │         │
│         │          ┌─────▼──────┐          │         │
│         │          │   JSON     │          │         │
│         │          │   Data     │          │         │
│         │          │   Files    │          │         │
│         │          └────────────┘          │         │
│         │                                  │         │
│         │          ┌──────────────┐        │         │
│         └──────────►   Local      ◄────────┘         │
│                    │   Storage    │                  │
│                    └──────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

### Architecture Principles

1. **Local-First**: All functionality works offline without external dependencies
2. **State Management**: React Context API for application state
3. **Data Storage**: JSON files for static content, local storage for user progress
4. **Component-Based**: React functional components with hooks
5. **Type Safety**: TypeScript for compile-time type checking

## Data Models

### Core Types

```typescript
/**
 * Represents a mathematical topic chapter
 */
interface Chapter {
  id: string;
  name: string;
  description: string;
  questionCount: number;
}

/**
 * Represents a multiple-choice question
 */
interface Question {
  id: string;
  chapterId: string;
  questionText: string;
  choices: string[];
  correctAnswerIndex: number;
  topicTags: string[]; // Topic categories for weak area identification
  explanation?: string;
}

/**
 * Represents a user's answer to a question
 */
interface UserAnswer {
  questionId: string;
  selectedAnswerIndex: number;
  isCorrect: boolean;
  timestamp: number;
}

/**
 * Represents an active practice session
 */
interface PracticeSession {
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
interface SessionResults {
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
 * Progress data stored in local storage
 */
interface ProgressData {
  sessionHistory: Array<{
    sessionId: string;
    chapterName: string;
    score: number;
    accuracy: number;
    completionTime: number;
    timestamp: number;
  }>;
}
```

### Data Files Structure

```typescript
/**
 * chapters.json structure
 */
interface ChaptersData {
  chapters: Chapter[];
}

/**
 * questions.json structure
 * Each question must include at least one topic tag for weak area identification
 */
interface QuestionsData {
  questions: Question[];
}
```

**Topic Tags**: Each question must have at least one topic tag. These tags are used to identify weak areas when a user answers incorrectly. Topic tags can represent mathematical concepts (e.g., "multiplication", "fractions", "percentages") and enable fine-grained feedback beyond just chapter-level categorization.

## Component Architecture

### Component Hierarchy

```
App
├── ApplicationProvider (Context Provider)
    ├── HomeScreen
    │   ├── ChapterCard (×8)
    │   └── MixedChallengeCard
    ├── PracticeScreen
    │   ├── QuestionDisplay
    │   ├── AnswerChoices
    │   └── SessionProgress
    └── ResultsScreen
        ├── SessionStats
        ├── IncorrectQuestions
        └── WeakAreasDisplay
```

### Component Specifications

#### HomeScreen

**Purpose**: Display available chapters and initiate practice sessions

**Props**: None (uses context)

**State**: None (stateless, reads from context)

**Behavior**:
- Displays 8 mathematical topic chapters in a grid
- Displays Mixed Challenge as a separate 9th option below or after the chapter grid
- Handles chapter selection and session initiation

```typescript
interface HomeScreenProps {}

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const { chapters, startSession, startMixedChallenge } = useAppContext();
  
  return (
    <div className="home-screen">
      <h1>RecallIQ</h1>
      <div className="chapters-grid">
        {chapters.map(chapter => (
          <ChapterCard 
            key={chapter.id}
            chapter={chapter}
            onSelect={() => startSession(chapter.id)}
          />
        ))}
      </div>
      <div className="mixed-challenge-section">
        <MixedChallengeCard onSelect={startMixedChallenge} />
      </div>
    </div>
  );
};
```

#### PracticeScreen

**Purpose**: Display questions and handle user answers during a practice session

**Props**: None (uses context)

**State**: None (stateless, reads from context)

**Behavior**:
- Displays current question and answer choices
- Records user answers
- Updates streak
- Advances through questions
- Completes session after 10 questions

```typescript
interface PracticeScreenProps {}

const PracticeScreen: React.FC<PracticeScreenProps> = () => {
  const { session, answerQuestion } = useAppContext();
  
  const currentQuestion = session.questions[session.currentQuestionIndex];
  
  const handleAnswer = (answerIndex: number) => {
    answerQuestion(answerIndex);
  };
  
  return (
    <div className="practice-screen">
      <SessionProgress 
        current={session.currentQuestionIndex + 1}
        total={session.questions.length}
        streak={session.streak}
      />
      <QuestionDisplay question={currentQuestion} />
      <AnswerChoices 
        choices={currentQuestion.choices}
        onSelect={handleAnswer}
      />
    </div>
  );
};
```

#### ResultsScreen

**Purpose**: Display session results and performance metrics

**Props**: None (uses context)

**State**: None (stateless, reads from context)

**Behavior**:
- Displays score, accuracy, streak, and completion time
- Shows incorrectly answered questions with correct answers
- Identifies and displays weak areas
- Provides navigation back to home

```typescript
interface ResultsScreenProps {}

const ResultsScreen: React.FC<ResultsScreenProps> = () => {
  const { results, returnToHome } = useAppContext();
  
  return (
    <div className="results-screen">
      <SessionStats results={results} />
      <IncorrectQuestions questions={results.incorrectQuestions} />
      <WeakAreasDisplay areas={results.weakAreas} />
      <button onClick={returnToHome}>Return to Home</button>
    </div>
  );
};
```

## State Management

### Application Context

The application uses React Context API to manage global state. A single context provider wraps the entire application and provides access to:

- Available chapters
- Current practice session
- Session results
- Progress data
- State transition functions

```typescript
interface AppContextValue {
  // Data
  chapters: Chapter[];
  session: PracticeSession | null;
  results: SessionResults | null;
  progress: ProgressData;
  
  // Screen state
  currentScreen: 'home' | 'practice' | 'results';
  
  // Actions
  startSession: (chapterId: string) => void;
  startMixedChallenge: () => void;
  answerQuestion: (answerIndex: number) => void;
  returnToHome: () => void;
  
  // Loading state
  isLoading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within ApplicationProvider');
  }
  return context;
};
```

### State Transitions

```
┌──────────┐
│   Home   │
└────┬─────┘
     │ startSession() / startMixedChallenge()
     ▼
┌──────────┐
│ Practice │
└────┬─────┘
     │ answerQuestion() × 10
     ▼
┌──────────┐
│ Results  │
└────┬─────┘
     │ returnToHome()
     ▼
┌──────────┐
│   Home   │
└──────────┘
```

### Context Provider Implementation

```typescript
export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [results, setResults] = useState<SessionResults | null>(null);
  const [progress, setProgress] = useState<ProgressData>({ sessionHistory: [] });
  const [currentScreen, setCurrentScreen] = useState<'home' | 'practice' | 'results'>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load data on mount
  useEffect(() => {
    loadChapters();
    loadQuestions();
    loadProgress();
  }, []);
  
  const startSession = (chapterId: string) => {
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
  };
  
  const startMixedChallenge = () => {
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
  };
  
  const answerQuestion = (answerIndex: number) => {
    if (!session) return;
    
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswerIndex;
    
    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedAnswerIndex: answerIndex,
      isCorrect,
      timestamp: Date.now(),
    };
    
    // Streak increments by 1 on correct, is SET to 0 on incorrect (always 0, not decremented)
    const newStreak = isCorrect ? session.streak + 1 : 0;
    const newMaxStreak = Math.max(session.maxStreak, newStreak);
    
    const updatedSession = {
      ...session,
      userAnswers: [...session.userAnswers, userAnswer],
      currentQuestionIndex: session.currentQuestionIndex + 1,
      streak: newStreak,
      maxStreak: newMaxStreak,
    };
    
    // Check if session is complete
    if (updatedSession.currentQuestionIndex >= updatedSession.questions.length) {
      completeSession(updatedSession);
    } else {
      setSession(updatedSession);
    }
  };
  
  const completeSession = (completedSession: PracticeSession) => {
    const endTime = Date.now();
    const completionTime = endTime - completedSession.startTime;
    
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
    
    // Weak areas are derived from topic tags of incorrectly answered questions
    const weakAreas = [...new Set(
      incorrectQuestions.flatMap(iq => iq.question.topicTags)
    )];
    
    const score = completedSession.userAnswers.filter(a => a.isCorrect).length;
    const accuracy = (score / completedSession.questions.length) * 100;
    
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
    
    setResults(sessionResults);
    saveProgress(sessionResults);
    setCurrentScreen('results');
    setSession(null);
  };
  
  const returnToHome = () => {
    setSession(null);
    setResults(null);
    setCurrentScreen('home');
  };
  
  // ... helper functions for data loading and storage
  
  const value: AppContextValue = {
    chapters,
    session,
    results,
    progress,
    currentScreen,
    startSession,
    startMixedChallenge,
    answerQuestion,
    returnToHome,
    isLoading,
    error,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
```

## Data Layer

### Question Selection Logic

```typescript
/**
 * Select 10 random questions from a specific chapter
 */
function selectQuestionsForChapter(
  chapterId: string,
  allQuestions: Question[]
): Question[] {
  const chapterQuestions = allQuestions.filter(q => q.chapterId === chapterId);
  return shuffleArray(chapterQuestions).slice(0, 10);
}

/**
 * Select 10 questions from multiple chapters for Mixed Challenge
 * Ensures at least 2 different chapters are represented
 */
function selectMixedQuestions(allQuestions: Question[]): Question[] {
  const chapters = [...new Set(allQuestions.map(q => q.chapterId))];
  
  // Ensure at least 2 chapters
  const selectedChapters = shuffleArray(chapters).slice(0, Math.max(2, Math.floor(Math.random() * chapters.length) + 1));
  
  const questionsPerChapter = Math.floor(10 / selectedChapters.length);
  const remainder = 10 % selectedChapters.length;
  
  let mixedQuestions: Question[] = [];
  
  selectedChapters.forEach((chapterId, index) => {
    const chapterQuestions = allQuestions.filter(q => q.chapterId === chapterId);
    const count = questionsPerChapter + (index < remainder ? 1 : 0);
    const selected = shuffleArray(chapterQuestions).slice(0, count);
    mixedQuestions = [...mixedQuestions, ...selected];
  });
  
  return shuffleArray(mixedQuestions).slice(0, 10);
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

### Local Storage Integration

```typescript
const STORAGE_KEY = 'recalliq_progress';

/**
 * Load progress data from local storage
 * Returns empty default structure for first-time users
 */
function loadProgressFromStorage(): ProgressData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // First-time use: return default empty structure
      return { sessionHistory: [] };
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load progress:', error);
    // On error, return default empty structure
    return { sessionHistory: [] };
  }
}

/**
 * Save progress data to local storage
 */
function saveProgressToStorage(
  currentProgress: ProgressData,
  results: SessionResults,
  chapters: Chapter[]
): ProgressData {
  const chapterName = results.chapterId 
    ? chapters.find(c => c.id === results.chapterId)?.name || 'Unknown'
    : 'Mixed Challenge';
  
  const newEntry = {
    sessionId: results.sessionId,
    chapterName,
    score: results.score,
    accuracy: results.accuracy,
    completionTime: results.completionTime,
    timestamp: Date.now(),
  };
  
  const updatedProgress: ProgressData = {
    sessionHistory: [...currentProgress.sessionHistory, newEntry],
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProgress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
  
  return updatedProgress;
}
```

### JSON Data Loading

```typescript
/**
 * Load chapters from JSON file
 */
async function loadChaptersData(): Promise<Chapter[]> {
  try {
    const response = await fetch('/data/chapters.json');
    if (!response.ok) {
      throw new Error('Failed to load chapters');
    }
    const data: ChaptersData = await response.json();
    return data.chapters;
  } catch (error) {
    console.error('Error loading chapters:', error);
    throw error;
  }
}

/**
 * Load questions from JSON file
 */
async function loadQuestionsData(): Promise<Question[]> {
  try {
    const response = await fetch('/data/questions.json');
    if (!response.ok) {
      throw new Error('Failed to load questions');
    }
    const data: QuestionsData = await response.json();
    
    // Validate that all questions have at least one topic tag
    data.questions.forEach(question => {
      if (!question.topicTags || question.topicTags.length === 0) {
        console.warn(`Question ${question.id} is missing topic tags`);
      }
    });
    
    return data.questions;
  } catch (error) {
    console.error('Error loading questions:', error);
    throw error;
  }
}

/**
 * Example question structure in questions.json:
 * {
 *   "id": "q1",
 *   "chapterId": "fractions-percentages",
 *   "questionText": "What is 3/4 as a percentage?",
 *   "choices": ["50%", "60%", "75%", "80%"],
 *   "correctAnswerIndex": 2,
 *   "topicTags": ["fractions", "percentages", "conversion"],
 *   "explanation": "3/4 = 0.75 = 75%"
 * }
 */
```

## Error Handling

### Error Scenarios

1. **Data Loading Failures**
   - JSON files not found
   - Malformed JSON data
   - Network errors (even though offline)

2. **State Management Errors**
   - Invalid state transitions
   - Missing context provider
   - Corrupted session data

3. **Storage Errors**
   - Local storage full
   - Local storage access denied
   - Corrupted stored data

### Error Handling Strategy

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <h1>Something went wrong</h1>
          <p>Please refresh the page to try again.</p>
          <button onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## User Interface Design

### Screen Flow

```
Home Screen → Practice Screen → Results Screen → Home Screen
     ↑                                                ↓
     └────────────────────────────────────────────────┘
```

### Responsive Design Approach

- **Mobile-first design**: Base styles for mobile screens
- **Breakpoints**:
  - Small: < 640px (mobile)
  - Medium: 640px - 1024px (tablet)
  - Large: > 1024px (desktop)
- **Flexible layouts**: CSS Grid and Flexbox
- **Readable typography**: Minimum 16px base font size
- **Touch-friendly**: Minimum 44px touch targets

### Styling Architecture

```typescript
// Use CSS Modules or styled-components for component styling
// Example with CSS Modules:

// HomeScreen.module.css
.homeScreen {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.chaptersGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.mixedChallengeSection {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
}

@media (max-width: 640px) {
  .chaptersGrid {
    grid-template-columns: 1fr;
  }
}
```

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Load question data only when needed
2. **Memoization**: Use React.memo for expensive components
3. **Virtual Rendering**: Not needed for 10-question sessions
4. **Local Storage**: Minimal writes (only on session completion)
5. **Bundle Size**: Tree-shaking to remove unused code

### Performance Targets

- Initial load: < 2 seconds
- Question navigation: < 100ms
- Session completion: < 200ms
- Local storage write: < 50ms

## Testing Strategy

### Unit Testing

- **Component Tests**: Test each component in isolation
- **State Management Tests**: Test context provider logic
- **Data Layer Tests**: Test question selection and storage functions
- **Utility Tests**: Test helper functions

### Property-Based Testing

Property-based tests will validate universal properties across randomized inputs, using a minimum of 100 iterations per test. Each property test references its corresponding design property.

### Integration Testing

- **User Flows**: Test complete session flows
- **Storage Integration**: Test local storage persistence
- **Data Loading**: Test JSON file loading

### Example Test Structure

```typescript
// Example unit test
describe('selectQuestionsForChapter', () => {
  it('should return exactly 10 questions', () => {
    const questions = createMockQuestions(20);
    const selected = selectQuestionsForChapter('chapter1', questions);
    expect(selected).toHaveLength(10);
  });
});

// Example property test
describe('Question Selection Properties', () => {
  it('Property 1: Session always contains exactly 10 questions', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryQuestion, { minLength: 10, maxLength: 100 }),
        fc.string(),
        (questions, chapterId) => {
          const selected = selectQuestionsForChapter(chapterId, questions);
          return selected.length === 10;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

## Deployment

### Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
  base: './', // For relative paths in production
});
```

### Static Hosting

The application is a static site that can be hosted on:
- Netlify
- Vercel
- GitHub Pages
- Any static file server

Requirements:
- Serve `index.html` for all routes
- Include JSON data files in deployment
- No server-side processing needed

## File Structure

```
recalliq/
├── public/
│   ├── data/
│   │   ├── chapters.json
│   │   └── questions.json
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── HomeScreen/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── HomeScreen.module.css
│   │   │   ├── ChapterCard.tsx
│   │   │   └── MixedChallengeCard.tsx
│   │   ├── PracticeScreen/
│   │   │   ├── PracticeScreen.tsx
│   │   │   ├── PracticeScreen.module.css
│   │   │   ├── QuestionDisplay.tsx
│   │   │   ├── AnswerChoices.tsx
│   │   │   └── SessionProgress.tsx
│   │   ├── ResultsScreen/
│   │   │   ├── ResultsScreen.tsx
│   │   │   ├── ResultsScreen.module.css
│   │   │   ├── SessionStats.tsx
│   │   │   ├── IncorrectQuestions.tsx
│   │   │   └── WeakAreasDisplay.tsx
│   │   └── ErrorBoundary/
│   │       ├── ErrorBoundary.tsx
│   │       └── ErrorBoundary.module.css
│   ├── context/
│   │   ├── AppContext.tsx
│   │   └── ApplicationProvider.tsx
│   ├── hooks/
│   │   └── useAppContext.ts
│   ├── services/
│   │   ├── dataLoader.ts
│   │   ├── questionSelector.ts
│   │   └── storageService.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── shuffle.ts
│   │   └── generateId.ts
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Session Question Count Invariant

*For any* practice session (chapter-specific or Mixed Challenge), the session SHALL contain exactly 10 questions.

**Validates: Requirements 2.2, 4.1, 8.2**

### Property 2: Session Initialization

*For any* chapter selection, starting a practice session SHALL initialize the session with the first question displayed, streak set to zero, and completion time tracking started.

**Validates: Requirements 2.1, 2.3, 2.4, 2.5**

### Property 3: Question Data Integrity

*For any* question, it SHALL have exactly one answer marked as correct and SHALL display with multiple answer choices.

**Validates: Requirements 3.1, 3.2**

### Property 4: Answer Recording and Navigation

*For any* answer selection during a practice session, the system SHALL record the user's answer and advance to the next question.

**Validates: Requirements 3.3, 3.4**

### Property 5: Streak Increment on Correct Answer

*For any* correct answer selection, the system SHALL increment the streak counter by exactly one.

**Validates: Requirements 3.5**

### Property 6: Streak Reset on Incorrect Answer

*For any* incorrect answer selection, the system SHALL set the streak counter to zero (not decrement, but explicitly set to 0).

**Validates: Requirements 3.6**

### Property 7: Session Completion Trigger

*For any* practice session where the user answers the tenth question, the system SHALL end the practice session.

**Validates: Requirements 4.2**

### Property 8: Session Metrics Calculation

*For any* completed practice session, the system SHALL calculate and record score, accuracy, maximum streak, and completion time.

**Validates: Requirements 4.3, 4.4, 4.5, 4.6**

### Property 9: Results Screen Display

*For any* completed practice session, the system SHALL display the Results Screen with all session metrics (score, accuracy, streak, completion time).

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

### Property 10: Incorrect Questions Display

*For any* completed practice session with incorrect answers, the Results Screen SHALL display all incorrect questions with both the user's selected answer and the correct answer.

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 11: Weak Area Identification from Topic Tags

*For any* completed practice session with incorrect answers, the system SHALL identify weak areas by extracting all unique topic tags from incorrectly answered questions and display them on the Results Screen.

**Validates: Requirements 6.4, 6.5, 9.1, 9.2**

### Property 12: Progress Data Persistence and Retrieval

*For any* completed practice session, the system SHALL store progress data (score, accuracy, completion time, chapter name) to local storage and SHALL be able to retrieve that data unchanged. For first-time users with no stored data, the system SHALL return an empty default structure with zero score and no history.

**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7**

### Property 13: Mixed Challenge Multi-Chapter Requirement

*For any* Mixed Challenge practice session, the selected questions SHALL come from at least two different chapters.

**Validates: Requirements 8.3**

### Property 14: Home Navigation and State Reset

*For any* navigation from Results Screen to Home Screen, the system SHALL display all eight available chapters plus the Mixed Challenge option (as a 9th distinct option) and reset the practice session state to allow starting a new session.

**Validates: Requirements 1.10, 12.1, 12.2, 12.3**

## Implementation Notes

### Development Phases

**Phase 1: Foundation** (Week 1)
- Set up project structure
- Implement data models and types
- Create JSON data files with sample questions
- Implement data loading services

**Phase 2: State Management** (Week 1-2)
- Implement React Context API structure
- Build ApplicationProvider with core logic
- Implement session management functions
- Implement local storage integration

**Phase 3: Core UI** (Week 2-3)
- Build HomeScreen component
- Build PracticeScreen component
- Build ResultsScreen component
- Implement navigation flow

**Phase 4: Features** (Week 3)
- Implement question selection logic
- Implement streak tracking
- Implement results calculation
- Implement weak area identification

**Phase 5: Polish** (Week 4)
- Responsive design refinement
- Error handling
- Performance optimization
- Accessibility improvements

**Phase 6: Testing** (Week 4)
- Unit tests
- Property-based tests
- Integration tests
- Manual testing across devices

### Technology Stack

- **Framework**: React 18+
- **Language**: TypeScript 5+
- **Build Tool**: Vite 5+
- **Styling**: CSS Modules or Styled Components
- **Testing**: Vitest + Testing Library
- **Property Testing**: fast-check
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier

### Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.2",
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.2",
    "fast-check": "^3.19.0"
  }
}
```

## Security Considerations

### Data Privacy

- All data stored locally in browser
- No external data transmission
- No user authentication or personal data collection
- Progress data stored only in browser local storage

### Content Security

- No external scripts or resources
- All assets bundled with application
- No CDN dependencies
- Static content only

### Browser Storage

- Local storage size limits (typically 5-10MB)
- Handle storage quota exceeded errors gracefully
- Provide clear error messages if storage fails

## Accessibility

### WCAG Compliance Targets

- Semantic HTML elements
- Keyboard navigation support
- ARIA labels for interactive elements
- Sufficient color contrast (WCAG AA minimum)
- Readable font sizes (minimum 16px)
- Focus indicators for keyboard users
- Screen reader friendly component structure

### Keyboard Navigation

- Tab through chapters and options
- Enter to select chapter/submit answer
- Escape to return to previous screen (where applicable)
- Arrow keys for answer selection

## Browser Support

### Target Browsers

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile Safari (iOS): Latest 2 versions
- Chrome Mobile (Android): Latest 2 versions

### Required Features

- ES6+ JavaScript
- Local Storage API
- Fetch API
- CSS Grid and Flexbox

## Monitoring and Analytics

### For MVP

- No external analytics
- Browser console logging for development
- Error boundary for runtime error catching
- Local development metrics only

### Future Considerations

- Optional offline analytics
- Performance monitoring
- Usage statistics (if user opts in)

## Future Enhancements (Post-MVP)

1. **Progressive Web App (PWA)**
   - Service worker for offline capability
   - Install prompt for mobile devices
   - App manifest for home screen installation

2. **Advanced Features**
   - Timed mode with countdown
   - Daily challenges
   - Achievement system
   - Historical performance graphs

3. **Content Expansion**
   - More mathematical topics
   - Difficulty levels per chapter
   - Custom question sets

4. **Social Features**
   - Export progress to share
   - Challenge friends mode
   - Leaderboards (local only)

---

*This design document serves as the technical blueprint for the RecallIQ MVP. All implementation should follow these specifications to ensure consistency with the requirements and maintain code quality standards.*
