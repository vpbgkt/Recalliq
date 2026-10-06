/**
 * Local Storage Service
 * Manages user progress persistence using browser local storage
 */

import type { ProgressData, SessionResults, Chapter, Question } from '../types';

// Versioned storage key for future schema migration support
const STORAGE_KEY = 'recalliq_progress_v1';
const STORAGE_VERSION = 1;

/**
 * Storage structure with version for schema migration
 */
interface StorageWrapper {
  version: number;
  data: ProgressData;
}

/**
 * Load progress data from local storage
 * Returns empty default structure for first-time users or on error
 * 
 * @returns ProgressData with session history and topic performance
 */
export function loadProgressFromStorage(): ProgressData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    // First-time user: no data stored yet
    if (!stored) {
      console.log('No stored progress found - first-time user');
      return createDefaultProgress();
    }
    
    // Parse and validate stored data
    const parsed = JSON.parse(stored);
    
    // Handle legacy data without version wrapper
    if (!parsed.version) {
      console.warn('Legacy storage format detected - migrating to versioned format');
      // If it looks like old ProgressData, wrap it
      if (parsed.sessionHistory && Array.isArray(parsed.sessionHistory)) {
        const migrated = migrateToVersionedFormat(parsed);
        saveProgressToStorageInternal(migrated);
        return migrated;
      }
      // Otherwise, corrupted - reset
      console.error('Corrupted legacy data - resetting to default');
      return createDefaultProgress();
    }
    
    // Validate versioned data structure
    const wrapper = parsed as StorageWrapper;
    
    if (wrapper.version !== STORAGE_VERSION) {
      console.warn(`Storage version mismatch: found ${wrapper.version}, expected ${STORAGE_VERSION}`);
      // Future: handle version migration here
      return createDefaultProgress();
    }
    
    // Validate data structure
    if (!wrapper.data || !wrapper.data.sessionHistory || !Array.isArray(wrapper.data.sessionHistory)) {
      console.error('Invalid storage data structure - resetting to default');
      return createDefaultProgress();
    }
    
    // Ensure topicPerformance exists (backward compatibility)
    if (!wrapper.data.topicPerformance) {
      console.log('Adding topicPerformance to existing data');
      wrapper.data.topicPerformance = {};
    }
    
    return wrapper.data;
    
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to load progress from storage:', error.message);
    } else {
      console.error('Failed to load progress from storage: Unknown error');
    }
    
    // On any error, return default empty structure
    return createDefaultProgress();
  }
}

/**
 * Save progress data to local storage after a session completes
 * Updates both session history and topic performance
 * 
 * Note: To properly track topic performance, the caller must provide all questions
 * in the session (via results.incorrectQuestions and separately tracking correct ones)
 * or enhance SessionResults to include all questions.
 * 
 * Current implementation tracks topics from incorrect questions only,
 * which identifies weak areas but doesn't track mastery of correct topics.
 * 
 * @param currentProgress Current progress data
 * @param results Session results to append
 * @param chapters Available chapters for name lookup
 * @param allSessionQuestions Optional: All questions from the session for complete tracking
 * @returns Updated progress data
 */
export function saveProgressToStorage(
  currentProgress: ProgressData,
  results: SessionResults,
  chapters: Chapter[],
  allSessionQuestions?: Question[]
): ProgressData {
  try {
    // Determine chapter name
    const chapterName = results.chapterId 
      ? chapters.find(c => c.id === results.chapterId)?.name || 'Unknown'
      : 'Mixed Challenge';
    
    // Create new session history entry
    const newEntry = {
      sessionId: results.sessionId,
      chapterName,
      score: results.score,
      accuracy: results.accuracy,
      completionTime: results.completionTime,
      timestamp: Date.now(),
    };
    
    // Update topic performance
    const updatedTopicPerformance = { ...currentProgress.topicPerformance };
    
    if (allSessionQuestions && allSessionQuestions.length > 0) {
      // Full tracking: we have all questions with correct/incorrect status
      const incorrectQuestionIds = new Set(
        results.incorrectQuestions.map(iq => iq.question.id)
      );
      
      allSessionQuestions.forEach(question => {
        const isCorrect = !incorrectQuestionIds.has(question.id);
        
        question.topicTags.forEach(tag => {
          if (!updatedTopicPerformance[tag]) {
            updatedTopicPerformance[tag] = { attempts: 0, correct: 0 };
          }
          updatedTopicPerformance[tag].attempts += 1;
          if (isCorrect) {
            updatedTopicPerformance[tag].correct += 1;
          }
        });
      });
    } else {
      // Minimal tracking: only track incorrect questions (weak areas only)
      // This is sufficient for Weak Areas feature but doesn't track mastery
      results.incorrectQuestions.forEach(({ question }) => {
        question.topicTags.forEach(tag => {
          if (!updatedTopicPerformance[tag]) {
            updatedTopicPerformance[tag] = { attempts: 0, correct: 0 };
          }
          updatedTopicPerformance[tag].attempts += 1;
          // incorrect, so correct count not incremented
        });
      });
    }
    
    // Append to history
    const updatedProgress: ProgressData = {
      sessionHistory: [...currentProgress.sessionHistory, newEntry],
      topicPerformance: updatedTopicPerformance,
    };
    
    // Wrap with version for future migration support
    const wrapper: StorageWrapper = {
      version: STORAGE_VERSION,
      data: updatedProgress,
    };
    
    // Attempt to save to localStorage
    try {
      const serialized = JSON.stringify(wrapper);
      localStorage.setItem(STORAGE_KEY, serialized);
      console.log(`Progress saved: ${newEntry.chapterName} - Score: ${newEntry.score}/10`);
      
      // Log topic updates for debugging
      const topicCount = Object.keys(updatedTopicPerformance).length;
      console.log(`Topic performance tracking: ${topicCount} unique topics`);
    } catch (storageError) {
      // Handle quota exceeded or access denied
      if (storageError instanceof Error) {
        if (storageError.name === 'QuotaExceededError') {
          console.error('Local storage quota exceeded - cannot save progress');
          throw new Error('Storage quota exceeded. Please free up space.');
        } else if (storageError.name === 'SecurityError') {
          console.error('Local storage access denied - cannot save progress');
          throw new Error('Storage access denied. Check browser settings.');
        } else {
          console.error('Failed to write to local storage:', storageError.message);
          throw new Error(`Storage error: ${storageError.message}`);
        }
      }
      throw new Error('Failed to save progress to storage');
    }
    
    return updatedProgress;
    
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to save progress:', error.message);
      // Re-throw storage errors to caller
      throw error;
    }
    throw new Error('Failed to save progress: Unknown error');
  }
}

/**
 * Internal save function without session result processing
 * Used for data migration
 */
function saveProgressToStorageInternal(progress: ProgressData): void {
  const wrapper: StorageWrapper = {
    version: STORAGE_VERSION,
    data: progress,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapper));
  } catch (error) {
    console.error('Failed to save migrated progress:', error);
  }
}

/**
 * Create default empty progress structure for first-time users
 */
function createDefaultProgress(): ProgressData {
  return {
    sessionHistory: [],
    topicPerformance: {},
  };
}

/**
 * Migrate legacy unversioned data to versioned format
 * Adds topicPerformance field for backward compatibility
 */
function migrateToVersionedFormat(legacyData: Partial<ProgressData>): ProgressData {
  return {
    sessionHistory: legacyData.sessionHistory || [],
    topicPerformance: legacyData.topicPerformance || {},
  };
}

/**
 * Clear all stored progress data (for testing or user request)
 * Use with caution - this is destructive
 */
export function clearProgressStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Progress data cleared');
  } catch (error) {
    console.error('Failed to clear progress storage:', error);
  }
}

/**
 * Get storage usage information for debugging
 */
export function getStorageInfo(): { 
  hasData: boolean; 
  entryCount: number; 
  topicCount: number;
  sizeBytes: number;
} {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { hasData: false, entryCount: 0, topicCount: 0, sizeBytes: 0 };
    }
    
    const parsed = JSON.parse(stored);
    const wrapper = parsed as StorageWrapper;
    const entryCount = wrapper.data?.sessionHistory?.length || 0;
    const topicCount = Object.keys(wrapper.data?.topicPerformance || {}).length;
    const sizeBytes = new Blob([stored]).size;
    
    return { hasData: true, entryCount, topicCount, sizeBytes };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return { hasData: false, entryCount: 0, topicCount: 0, sizeBytes: 0 };
  }
}

/**
 * Get weak areas based on topic performance
 * Returns topics that have been attempted but have low accuracy
 * 
 * @param progress Current progress data
 * @param minAttempts Minimum attempts to consider (default: 1 for immediate feedback)
 * @param accuracyThreshold Accuracy threshold below which topic is weak (default: 0.7 = 70%)
 * @returns Array of weak topic tags sorted by accuracy (worst first)
 */
export function getWeakAreas(
  progress: ProgressData,
  minAttempts: number = 1,
  accuracyThreshold: number = 0.7
): string[] {
  const weakTopics: Array<{ tag: string; accuracy: number }> = [];
  
  Object.entries(progress.topicPerformance).forEach(([tag, stats]) => {
    // Only consider topics with minimum attempts
    if (stats.attempts >= minAttempts) {
      const accuracy = stats.attempts > 0 ? stats.correct / stats.attempts : 0;
      if (accuracy < accuracyThreshold) {
        weakTopics.push({ tag, accuracy });
      }
    }
  });
  
  // Sort by accuracy (worst first)
  weakTopics.sort((a, b) => a.accuracy - b.accuracy);
  
  return weakTopics.map(t => t.tag);
}

