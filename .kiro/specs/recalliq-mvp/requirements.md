# Requirements Document

## Introduction

RecallIQ is a local-first mathematics practice application designed to help users strengthen their mathematical recall through practice sessions. The MVP provides a fully functional offline application with eight mathematical topic chapters, multiple-choice questions, performance tracking, and a mixed challenge mode. All content is stored locally in JSON data files, state is managed through React Context API, and progress persists in browser local storage.

## Glossary

- **Application**: The RecallIQ web-based mathematics practice system
- **Chapter**: A collection of practice questions focused on a specific mathematical topic
- **Practice_Session**: A session consisting of exactly 10 questions from a selected chapter
- **Mixed_Challenge**: A practice session combining questions from multiple chapters
- **Question**: A multiple-choice problem with exactly one correct answer
- **User**: The person interacting with the Application
- **Score**: The number of questions answered correctly in a Practice_Session
- **Accuracy**: The percentage of correct answers calculated as (Score / Total_Questions) × 100
- **Streak**: The count of consecutive correct answers during a Practice_Session
- **Completion_Time**: The total duration from Practice_Session start to finish
- **Weak_Area**: A topic or category tag associated with incorrectly answered Questions
- **Topic_Tag**: A category label assigned to each Question identifying its subject area
- **Progress_Data**: Performance statistics stored in browser local storage
- **Home_Screen**: The main interface displaying available Chapters
- **Results_Screen**: The interface displaying Practice_Session outcomes

## Requirements

### Requirement 1

**User Story:** As a user, I want to see available mathematical topics on the home screen, so that I can choose what to practice

#### Acceptance Criteria

1. THE Application SHALL display eight Chapter options on the Home_Screen
2. THE Application SHALL display "Fractions & Percentages" as a Chapter option
3. THE Application SHALL display "Squares" as a Chapter option
4. THE Application SHALL display "Cubes" as a Chapter option
5. THE Application SHALL display "Square Roots" as a Chapter option
6. THE Application SHALL display "Cube Roots" as a Chapter option
7. THE Application SHALL display "Decimal & Fraction Conversions" as a Chapter option
8. THE Application SHALL display "Ratios & Percentages" as a Chapter option
9. THE Application SHALL display "Formula Recall" as a Chapter option
10. THE Application SHALL display "Mixed Challenge" as a ninth option on the Home_Screen in addition to the eight Chapter options

### Requirement 2

**User Story:** As a user, I want to start a practice session for any chapter, so that I can practice specific mathematical topics

#### Acceptance Criteria

1. WHEN the User selects a Chapter, THE Application SHALL start a Practice_Session
2. WHEN a Practice_Session starts, THE Application SHALL load exactly 10 Questions from the selected Chapter
3. WHEN a Practice_Session starts, THE Application SHALL display the first Question
4. WHEN a Practice_Session starts, THE Application SHALL initialize Streak to zero
5. WHEN a Practice_Session starts, THE Application SHALL start tracking Completion_Time

### Requirement 3

**User Story:** As a user, I want to answer multiple-choice questions, so that I can test my mathematical knowledge

#### Acceptance Criteria

1. THE Application SHALL display each Question with multiple answer choices
2. THE Application SHALL display exactly one correct answer per Question
3. WHEN the User selects an answer choice, THE Application SHALL record the User's answer
4. WHEN the User selects an answer choice, THE Application SHALL advance to the next Question
5. IF the User selects the correct answer, THEN THE Application SHALL increment Streak by one
6. IF the User selects an incorrect answer, THEN THE Application SHALL set Streak to zero

### Requirement 4

**User Story:** As a user, I want to complete a practice session with exactly 10 questions, so that I have a consistent practice experience

#### Acceptance Criteria

1. THE Application SHALL present exactly 10 Questions per Practice_Session
2. WHEN the User answers the tenth Question, THE Application SHALL end the Practice_Session
3. WHEN a Practice_Session ends, THE Application SHALL calculate Score
4. WHEN a Practice_Session ends, THE Application SHALL calculate Accuracy
5. WHEN a Practice_Session ends, THE Application SHALL record final Streak value
6. WHEN a Practice_Session ends, THE Application SHALL record Completion_Time

### Requirement 5

**User Story:** As a user, I want to see my performance results after completing a practice session, so that I understand how well I performed

#### Acceptance Criteria

1. WHEN a Practice_Session ends, THE Application SHALL display the Results_Screen
2. THE Application SHALL display Score on the Results_Screen
3. THE Application SHALL display Accuracy on the Results_Screen
4. THE Application SHALL display highest Streak on the Results_Screen
5. THE Application SHALL display Completion_Time on the Results_Screen

### Requirement 6

**User Story:** As a user, I want to see which questions I answered incorrectly, so that I can learn from my mistakes

#### Acceptance Criteria

1. THE Application SHALL display all incorrectly answered Questions on the Results_Screen
2. WHEN displaying an incorrect Question, THE Application SHALL show the User's selected answer
3. WHEN displaying an incorrect Question, THE Application SHALL show the correct answer
4. THE Application SHALL identify Weak_Areas based on Topic_Tags of incorrectly answered Questions
5. THE Application SHALL display Weak_Areas on the Results_Screen

### Requirement 7

**User Story:** As a user, I want my practice progress saved locally, so that I can track my improvement over time

#### Acceptance Criteria

1. WHEN a Practice_Session ends, THE Application SHALL store Progress_Data in browser local storage
2. THE Application SHALL store Score in Progress_Data
3. THE Application SHALL store Accuracy in Progress_Data
4. THE Application SHALL store Completion_Time in Progress_Data
5. THE Application SHALL store the Chapter name in Progress_Data
6. WHEN retrieving Progress_Data, THE Application SHALL display Progress_Data
7. IF no Progress_Data has been stored, THEN THE Application SHALL display an empty progress view with zero score and no history

### Requirement 8

**User Story:** As a user, I want to practice with questions from multiple chapters, so that I can test my knowledge across different topics

#### Acceptance Criteria

1. WHEN the User selects Mixed_Challenge, THE Application SHALL start a Practice_Session
2. WHEN Mixed_Challenge starts, THE Application SHALL load exactly 10 Questions from multiple Chapters
3. WHEN Mixed_Challenge starts, THE Application SHALL select Questions from at least two different Chapters
4. THE Application SHALL apply all Practice_Session rules to Mixed_Challenge

### Requirement 9

**User Story:** As a user, I want each question tagged with topic categories, so that the application can identify my weak areas

#### Acceptance Criteria

1. THE Application SHALL load Topic_Tag data for each Question from local JSON data files
2. THE Application SHALL associate at least one Topic_Tag with each Question

### Requirement 10

**User Story:** As a user, I want all content stored locally, so that I can use the application without an internet connection

#### Acceptance Criteria

1. THE Application SHALL load all Question content from local JSON data files
2. THE Application SHALL load all Chapter definitions from local JSON data files
3. THE Application SHALL function without internet connectivity
4. THE Application SHALL NOT require user authentication
5. THE Application SHALL NOT communicate with backend servers
6. THE Application SHALL NOT communicate with external databases
7. THE Application SHALL NOT communicate with AI APIs
8. THE Application SHALL NOT communicate with external paid services

### Requirement 11

**User Story:** As a user, I want state managed through React Context API, so that the application has a consistent and maintainable architecture

#### Acceptance Criteria

1. THE Application SHALL use React Context API for state management
2. THE Application SHALL store current Practice_Session state in React Context
3. THE Application SHALL store User answers in React Context during a Practice_Session
4. THE Application SHALL store Score, Accuracy, and Streak in React Context during a Practice_Session

### Requirement 12

**User Story:** As a user, I want a clean and responsive interface, so that I can use the application on different devices

#### Acceptance Criteria

1. THE Application SHALL display a responsive user interface
2. THE Application SHALL adapt layout to different screen sizes
3. THE Application SHALL maintain readability on mobile devices
4. THE Application SHALL maintain readability on desktop devices
5. THE Application SHALL render mathematical notation clearly

### Requirement 13

**User Story:** As a user, I want to navigate back to the home screen, so that I can start a new practice session

#### Acceptance Criteria

1. WHEN on the Results_Screen, THE Application SHALL provide a navigation option to the Home_Screen
2. WHEN the User navigates to the Home_Screen, THE Application SHALL display all available Chapters
3. WHEN the User navigates to the Home_Screen, THE Application SHALL reset Practice_Session state
