# Implementation Plan: RecallIQ MVP

## Overview

This streamlined implementation plan delivers a fully functional mathematics practice application with 8 chapters, Mixed Challenge mode, practice sessions, results tracking, and local storage persistence. The plan focuses on essential tasks only, removing all optional property tests and consolidating checkpoints to accelerate MVP delivery while maintaining complete functionality.

## Tasks

- [x] 1. Set up project foundation and data models
  - Create TypeScript type definitions for all data models (Chapter, Question with topicTags array, UserAnswer, PracticeSession, SessionResults, ProgressData)
  - Create JSON data files (chapters.json and questions.json) in public/data/ with sample content for all eight chapters
  - Ensure each Question in questions.json includes a topicTags array with at least one topic tag
  - Set up utility functions (shuffle algorithm, ID generator)
  - _Requirements: 1.2-1.9, 9.1, 9.2_

- [x] 2. Implement data loading and question selection services
  - [x] 2.1 Create data loader service
    - Implement loadChaptersData() to fetch and parse chapters.json
    - Implement loadQuestionsData() to fetch and parse questions.json
    - Validate that all questions have at least one topic tag in topicTags array
    - Add error handling for data loading failures
    - _Requirements: 9.1, 9.2, 10.1, 10.2_
  
  - [x] 2.2 Create question selection service
    - Implement selectQuestionsForChapter() to select 10 random questions from a specific chapter
    - Implement selectMixedQuestions() to select 10 questions from multiple chapters (at least 2 different chapters)
    - Implement shuffleArray() using Fisher-Yates algorithm
    - _Requirements: 2.2, 4.1, 8.2, 8.3_

- [x] 3. Implement local storage service
  - Implement loadProgressFromStorage() to read from local storage
  - For first-time users with no stored data, return empty default structure with sessionHistory: []
  - Implement saveProgressToStorage() to write session results to local storage
  - Add error handling for storage quota exceeded and access denied errors
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 4. Create React Context structure
  - Define AppContextValue interface with all state and actions
  - Create AppContext using createContext
  - Create useAppContext custom hook
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 5. Implement ApplicationProvider component foundation
  - Set up state variables (chapters, questions, session, results, progress, currentScreen, isLoading, error)
  - Implement useEffect to load chapters, questions, and progress on mount
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 6. Implement session start actions
  - Implement startSession(chapterId) to initialize chapter-specific practice session
  - Implement startMixedChallenge() to initialize mixed challenge session
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 8.1, 8.2, 8.3_

- [x] 7. Implement answerQuestion action
  - Record user answer with timestamp
  - Check correctness against question's correctAnswerIndex
  - Update streak (increment by 1 if correct, set to 0 if incorrect - not decrement)
  - Track maximum streak
  - Advance to next question or complete session if on question 10
  - _Requirements: 3.3, 3.4, 3.5, 3.6, 4.2_

- [x] 8. Implement completeSession function
  - Calculate score (number of correct answers)
  - Calculate accuracy percentage
  - Calculate completion time
  - Identify incorrect questions with user answer and correct answer
  - Identify weak areas by extracting unique topic tags from incorrectly answered questions' topicTags arrays
  - Create SessionResults object
  - Call saveProgressToStorage
  - Update state to show results screen
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 9.1, 9.2_

- [x] 9. Implement returnToHome action
  - Clear session state
  - Clear results state
  - Set currentScreen to 'home'
  - _Requirements: 13.1, 13.2, 13.3_

- [ ] 10. Create HomeScreen component structure
  - Create HomeScreen.tsx with component scaffold
  - Access chapters from context using useAppContext
  - Display application title
  - Render chapter grid layout for 8 chapters
  - Render Mixed Challenge as a separate 9th option below or after the chapter grid
  - _Requirements: 1.1, 1.10, 13.2_

- [ ] 11. Create ChapterCard and MixedChallengeCard components
  - [ ] 11.1 Create ChapterCard component
    - Display chapter name and description
    - Display question count
    - Handle click to call startSession with chapter ID
    - _Requirements: 1.2-1.9_
  
  - [ ] 11.2 Create MixedChallengeCard component
    - Display Mixed Challenge option as a 9th separate option
    - Display description explaining it combines multiple chapters
    - Handle click to call startMixedChallenge
    - _Requirements: 1.10, 8.1_

- [ ] 12. Add responsive CSS styling for HomeScreen
  - Create CSS module with mobile-first approach
  - Implement grid layout that adapts to screen size for 8 chapter cards
  - Style Mixed Challenge card as a distinct 9th option
  - Ensure minimum touch target size of 44px
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 13. Create PracticeScreen component structure
  - Create PracticeScreen.tsx with component scaffold
  - Access session from context using useAppContext
  - Get current question from session
  - Handle null session case
  - _Requirements: 2.3, 3.1_

- [ ] 14. Create SessionProgress component
  - Display current question number out of total (e.g., "5 / 10")
  - Display current streak value
  - _Requirements: 2.3, 3.5, 3.6_

- [ ] 15. Create QuestionDisplay component
  - Display question text with clear typography
  - Render mathematical notation properly
  - _Requirements: 3.1, 12.5_

- [ ] 16. Create AnswerChoices component
  - Display all answer choices as interactive buttons
  - Handle answer selection and call answerQuestion from context
  - Ensure touch-friendly button sizing
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 17. Add responsive CSS styling for PracticeScreen
  - Create CSS module with mobile-first approach
  - Style question display for readability
  - Style answer buttons with clear hover/focus states
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 18. Create ResultsScreen component structure
  - Create ResultsScreen.tsx with component scaffold
  - Access results from context using useAppContext
  - Handle null results case
  - _Requirements: 5.1_

- [ ] 19. Create SessionStats component
  - Display score (X out of 10)
  - Display accuracy percentage
  - Display highest streak
  - Display completion time (formatted in minutes and seconds)
  - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [ ] 20. Create IncorrectQuestions component
  - Display list of incorrect questions
  - For each incorrect question, show question text, user's answer, and correct answer
  - Handle case where no incorrect questions exist (perfect score)
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 21. Create WeakAreasDisplay component
  - Display identified weak areas (topic tags from incorrectly answered questions)
  - Handle case where no weak areas exist (perfect score)
  - _Requirements: 6.4, 6.5, 9.1, 9.2_

- [ ] 22. Add Return to Home button
  - Create button that calls returnToHome from context
  - _Requirements: 13.1_

- [ ] 23. Add responsive CSS styling for ResultsScreen
  - Create CSS module with mobile-first approach
  - Style stats display for clear visual hierarchy
  - Style incorrect questions list for readability
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 24. Create ErrorBoundary component
  - Implement React error boundary class component
  - Catch and display errors gracefully
  - Provide refresh button to recover
  - Log errors to console for debugging
  - _Requirements: 10.3_

- [ ] 25. Add error handling to ApplicationProvider
  - Handle data loading failures with error state
  - Display error messages to user when data fails to load
  - Handle local storage errors gracefully
  - Handle first-time users with no stored progress data by showing empty default view
  - _Requirements: 7.7, 10.3_

- [ ] 26. Add ARIA labels and semantic HTML
  - Use semantic HTML elements (button, nav, main, section)
  - Add ARIA labels to interactive elements
  - Ensure proper heading hierarchy
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 27. Implement keyboard navigation
  - Ensure all interactive elements are keyboard accessible
  - Add visible focus indicators
  - Test tab navigation through all screens
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 28. Update App.tsx to wire everything together
  - Wrap application with ErrorBoundary
  - Wrap application with ApplicationProvider
  - Conditionally render HomeScreen, PracticeScreen, or ResultsScreen based on currentScreen from context
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 13.1, 13.2, 13.3_

- [ ] 29. Add global CSS styles
  - Update index.css with base styles, typography, and color scheme
  - Ensure minimum 16px base font size
  - Set up CSS custom properties for theming
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 30. Final integration and manual testing
  - Test complete user flow: select chapter → answer questions → view results → return home
  - Test Mixed Challenge flow (verify it appears as 9th option and combines multiple chapters)
  - Verify progress persistence across sessions
  - Test first-time user experience with empty progress data
  - Test responsive behavior on different screen sizes
  - Verify all 8 chapters display correctly
  - Ensure streak tracking works correctly (increments on correct, set to 0 on incorrect)
  - Verify weak areas are identified from question topic tags (not chapter IDs)

## Notes

- This streamlined plan removes all optional property tests to accelerate MVP delivery
- Each task references specific requirements for traceability
- The implementation uses TypeScript for type safety throughout
- All components use React functional components with hooks
- State management is centralized through React Context API
- Data persistence uses browser local storage
- Question content is stored in JSON files in the public/data/ directory
- **Each question must include a topicTags array** with at least one topic tag for weak area identification
- **Weak areas are derived from topic tags** (not chapter IDs) to provide fine-grained feedback
- **Mixed Challenge is a 9th separate option** distinct from the 8 mathematical topic chapters
- **First-time users** see an empty default view when no progress data exists
- **Streak is set to 0** on incorrect answers (not decremented)
- Manual testing in task 30 ensures all features work correctly before delivery

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1"]
    },
    {
      "id": 1,
      "tasks": ["2.1", "2.2", "3"]
    },
    {
      "id": 2,
      "tasks": ["4", "5"]
    },
    {
      "id": 3,
      "tasks": ["6", "7"]
    },
    {
      "id": 4,
      "tasks": ["8", "9"]
    },
    {
      "id": 5,
      "tasks": ["10", "13", "18", "24"]
    },
    {
      "id": 6,
      "tasks": ["11.1", "11.2", "14", "15", "16", "19", "20", "21"]
    },
    {
      "id": 7,
      "tasks": ["12", "17", "22", "23", "25"]
    },
    {
      "id": 8,
      "tasks": ["26", "27", "28"]
    },
    {
      "id": 9,
      "tasks": ["29"]
    },
    {
      "id": 10,
      "tasks": ["30"]
    }
  ]
}
```
