/**
 * Question Selection Service
 * Selects questions for practice sessions
 */

import type { Question } from '../types';
import { shuffleArray } from '../utils/helpers';

/**
 * Select 10 random questions from a specific chapter
 * @param chapterId The ID of the chapter to select from
 * @param allQuestions All available questions
 * @returns Array of 10 questions from the specified chapter
 * @throws Error if chapter has fewer than 10 questions
 */
export function selectQuestionsForChapter(
  chapterId: string,
  allQuestions: Question[]
): Question[] {
  const chapterQuestions = allQuestions.filter((q) => q.chapterId === chapterId);
  
  if (chapterQuestions.length < 10) {
    throw new Error(
      `Chapter "${chapterId}" has only ${chapterQuestions.length} questions, need at least 10`
    );
  }
  
  return shuffleArray(chapterQuestions).slice(0, 10);
}

/**
 * Select 10 questions from multiple chapters for Mixed Challenge
 * Ensures at least 2 different chapters are represented
 * @param allQuestions All available questions
 * @returns Array of 10 questions from multiple chapters
 * @throws Error if insufficient questions or chapters available
 */
export function selectMixedQuestions(allQuestions: Question[]): Question[] {
  if (allQuestions.length < 10) {
    throw new Error('Insufficient questions for Mixed Challenge');
  }
  
  // Get unique chapter IDs
  const chapters = [...new Set(allQuestions.map((q) => q.chapterId))];
  
  if (chapters.length < 2) {
    throw new Error('Mixed Challenge requires at least 2 different chapters');
  }
  
  // Randomly select 2 to all chapters to include
  const numChaptersToUse = Math.max(2, Math.floor(Math.random() * chapters.length) + 1);
  const selectedChapters = shuffleArray(chapters).slice(0, numChaptersToUse);
  
  // Calculate how many questions per chapter
  const questionsPerChapter = Math.floor(10 / selectedChapters.length);
  const remainder = 10 % selectedChapters.length;
  
  let mixedQuestions: Question[] = [];
  
  selectedChapters.forEach((chapterId, index) => {
    const chapterQuestions = allQuestions.filter((q) => q.chapterId === chapterId);
    
    // First chapters get one extra question if there's a remainder
    const count = questionsPerChapter + (index < remainder ? 1 : 0);
    
    const selected = shuffleArray(chapterQuestions).slice(0, count);
    mixedQuestions = [...mixedQuestions, ...selected];
  });
  
  // Shuffle the final mixed set so chapters aren't grouped
  const shuffled = shuffleArray(mixedQuestions);

  // Guard: if chapter stock was thin the accumulation may be short.
  // Fill from the remaining pool until we have exactly 10.
  if (shuffled.length < 10) {
    const usedIds = new Set(shuffled.map((q) => q.id));
    const remaining = shuffleArray(allQuestions.filter((q) => !usedIds.has(q.id)));
    const needed = 10 - shuffled.length;
    shuffled.push(...remaining.slice(0, needed));
  }

  if (shuffled.length < 10) {
    throw new Error('Insufficient questions for Mixed Challenge after filling');
  }

  return shuffled.slice(0, 10);
}

