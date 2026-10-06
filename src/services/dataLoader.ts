/**
 * Data Loader Service
 * Loads chapters and questions from local JSON files
 */

import type { Chapter, ChaptersData, Question, QuestionsData } from '../types';

/**
 * Load chapters from local JSON file
 * @returns Promise resolving to array of chapters
 * @throws Error if loading or parsing fails
 */
export async function loadChaptersData(): Promise<Chapter[]> {
  try {
    const response = await fetch('/data/chapters.json');
    
    if (!response.ok) {
      throw new Error(`Failed to load chapters: ${response.status} ${response.statusText}`);
    }
    
    const data: ChaptersData = await response.json();
    
    if (!data.chapters || !Array.isArray(data.chapters)) {
      throw new Error('Invalid chapters data structure');
    }
    
    return data.chapters;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error loading chapters:', error.message);
      throw new Error(`Failed to load chapters: ${error.message}`);
    }
    throw new Error('Failed to load chapters: Unknown error');
  }
}

/**
 * Load questions from local JSON file and validate topic tags
 * @returns Promise resolving to array of questions
 * @throws Error if loading, parsing, or validation fails
 */
export async function loadQuestionsData(): Promise<Question[]> {
  try {
    const response = await fetch('/data/questions.json');
    
    if (!response.ok) {
      throw new Error(`Failed to load questions: ${response.status} ${response.statusText}`);
    }
    
    const data: QuestionsData = await response.json();
    
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error('Invalid questions data structure');
    }
    
    // Validate that all questions have at least one topic tag
    const invalidQuestions = data.questions.filter(
      (q) => !q.topicTags || !Array.isArray(q.topicTags) || q.topicTags.length === 0
    );
    
    if (invalidQuestions.length > 0) {
      const ids = invalidQuestions.map((q) => q.id).join(', ');
      throw new Error(`Questions missing topic tags: ${ids}`);
    }
    
    return data.questions;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error loading questions:', error.message);
      throw new Error(`Failed to load questions: ${error.message}`);
    }
    throw new Error('Failed to load questions: Unknown error');
  }
}
