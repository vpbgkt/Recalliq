#!/usr/bin/env node
/**
 * RecallIQ MCP Server
 * Exposes 3 tools: list_topics, get_question, validate_question
 * Reads data from public/data/chapters.json and public/data/questions.json
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Data loading — resolve paths relative to this file so the server works
// regardless of cwd.
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'public', 'data');

const chaptersRaw = JSON.parse(readFileSync(join(dataDir, 'chapters.json'), 'utf8').replace(/^\uFEFF/, ''));
const questionsRaw = JSON.parse(readFileSync(join(dataDir, 'questions.json'), 'utf8').replace(/^\uFEFF/, ''));

/** @type {Array<{id:string,name:string,description:string,questionCount:number}>} */
const chapters = chaptersRaw.chapters;

/** @type {Array<{id:string,chapterId:string,questionText:string,choices:string[],correctAnswerIndex:number,topicTags:string[]}>} */
const questions = questionsRaw.questions;

// Pre-build chapter-id set for fast lookup
const validChapterIds = new Set(chapters.map((c) => c.id));

// Pre-build topic-tag index: chapterId -> sorted unique tags from its questions
const topicTagsByChapter = {};
for (const q of questions) {
  if (!topicTagsByChapter[q.chapterId]) topicTagsByChapter[q.chapterId] = new Set();
  for (const tag of q.topicTags) topicTagsByChapter[q.chapterId].add(tag);
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: 'recalliq-mcp',
  version: '1.0.0',
});

// ---------------------------------------------------------------------------
// Tool 1: list_topics
// ---------------------------------------------------------------------------

server.tool(
  'list_topics',
  'Return the 8 available mathematical chapters and their topic tags.',
  {},
  async () => {
    const result = chapters.map((chapter) => ({
      id: chapter.id,
      name: chapter.name,
      description: chapter.description,
      questionCount: chapter.questionCount,
      topicTags: Array.from(topicTagsByChapter[chapter.id] ?? []).sort(),
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Tool 2: get_question
// ---------------------------------------------------------------------------

server.tool(
  'get_question',
  'Return a question from the RecallIQ question bank by its ID.',
  { questionId: z.string().describe('The question ID, e.g. "sq-001"') },
  async ({ questionId }) => {
    const question = questions.find((q) => q.id === questionId);

    if (!question) {
      return {
        content: [{ type: 'text', text: `Question "${questionId}" not found.` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(question, null, 2) }],
    };
  }
);

// ---------------------------------------------------------------------------
// Tool 3: validate_question
// ---------------------------------------------------------------------------

server.tool(
  'validate_question',
  'Validate a question by ID against all RecallIQ content rules.',
  { questionId: z.string().describe('The question ID to validate, e.g. "fr-002"') },
  async ({ questionId }) => {
    const errors = [];
    const question = questions.find((q) => q.id === questionId);

    // Rule 1: question must exist
    if (!question) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ questionId, valid: false, errors: [`Question "${questionId}" not found`] }, null, 2),
          },
        ],
        isError: true,
      };
    }

    // Rule 2: chapter must be valid
    if (!validChapterIds.has(question.chapterId)) {
      errors.push(`chapterId "${question.chapterId}" is not a recognised chapter`);
    }

    // Rule 3: topicTags must be present and non-empty
    if (!Array.isArray(question.topicTags) || question.topicTags.length === 0) {
      errors.push('topicTags is missing or empty');
    }

    // Rule 4: must have exactly 4 choices
    if (!Array.isArray(question.choices) || question.choices.length !== 4) {
      errors.push(`choices must have exactly 4 items (found ${question.choices?.length ?? 0})`);
    }

    // Rule 5: correctAnswerIndex must be a valid index into choices
    const idx = question.correctAnswerIndex;
    if (typeof idx !== 'number' || !Number.isInteger(idx) || idx < 0 || idx >= (question.choices?.length ?? 0)) {
      errors.push(`correctAnswerIndex ${idx} is out of bounds for choices array`);
    }

    // Rule 6: exactly one answer marked correct (structural — by definition of the data model)
    // The data model stores a single integer index, so this is always satisfied when rule 5 passes.
    // We make it explicit for the report.
    const oneCorrect = errors.length === 0 || !errors.some((e) => e.includes('correctAnswerIndex'));
    if (!oneCorrect) {
      errors.push('cannot confirm exactly one correct answer (correctAnswerIndex is invalid)');
    }

    const valid = errors.length === 0;
    const report = { questionId, valid, ...(valid ? {} : { errors }) };

    return {
      content: [{ type: 'text', text: JSON.stringify(report, null, 2) }],
      ...(valid ? {} : { isError: true }),
    };
  }
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

const transport = new StdioServerTransport();
await server.connect(transport);
