import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const dataDirectory = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'data');

function readJson(fileName) {
  const content = readFileSync(join(dataDirectory, fileName), 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(content);
}

const chapters = readJson('chapters.json').chapters;
const questions = readJson('questions.json').questions;
const chaptersById = new Map(chapters.map((chapter) => [chapter.id, chapter]));

const server = new McpServer({
  name: 'recalliq-math-content',
  version: '1.0.0',
});

function jsonResult(value, isError = false) {
  return {
    content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
    ...(isError ? { isError: true } : {}),
  };
}

server.tool(
  'list_topics',
  'List RecallIQ chapters and unique topic tags from the question bank.',
  {},
  async () => {
    const topicTags = [...new Set(
      questions.flatMap((question) => (
        Array.isArray(question.topicTags)
          ? question.topicTags.filter((tag) => typeof tag === 'string')
          : []
      ))
    )].sort();

    return jsonResult({
      chapters: chapters.map(({ id, name }) => ({ id, name })),
      topicTags,
    });
  },
);

server.tool(
  'get_question',
  'Get a RecallIQ question and its chapter by question ID.',
  { questionId: z.string().describe('The question ID to retrieve.') },
  async ({ questionId }) => {
    const question = questions.find((item) => item.id === questionId);

    if (!question) {
      return jsonResult({
        error: {
          code: 'QUESTION_NOT_FOUND',
          message: `Question "${questionId}" was not found.`,
          questionId,
        },
      }, true);
    }

    const chapter = chaptersById.get(question.chapterId);
    return jsonResult({
      question,
      ...(chapter ? { chapter } : {}),
    });
  },
);

server.tool(
  'validate_question',
  'Validate a RecallIQ question against the content structure rules.',
  { questionId: z.string().describe('The question ID to validate.') },
  async ({ questionId }) => {
    const question = questions.find((item) => item.id === questionId);

    if (!question) {
      return jsonResult({
        valid: false,
        questionId,
        issues: [`Question "${questionId}" was not found.`],
      }, true);
    }

    const issues = [];

    if (typeof question.id !== 'string' || question.id.length === 0) {
      issues.push('id must be a non-empty string.');
    } else if (question.id !== questionId) {
      issues.push('id must match the requested questionId.');
    }
    if (typeof question.questionText !== 'string' || question.questionText.trim().length === 0) {
      issues.push('questionText must be a non-empty string.');
    }
    if (typeof question.chapterId !== 'string' || !chaptersById.has(question.chapterId)) {
      issues.push('chapterId must match an existing chapter.');
    }
    if (!Array.isArray(question.topicTags) || question.topicTags.length === 0) {
      issues.push('topicTags must exist and contain at least one tag.');
    } else if (question.topicTags.some((tag) => typeof tag !== 'string' || tag.trim().length === 0)) {
      issues.push('topicTags must contain only non-empty strings.');
    }
    if (!Array.isArray(question.choices) || question.choices.length !== 4) {
      issues.push('choices must contain exactly 4 items.');
    } else if (question.choices.some((choice) => typeof choice !== 'string' || choice.trim().length === 0)) {
      issues.push('choices must contain only non-empty strings.');
    }
    if (
      !Number.isInteger(question.correctAnswerIndex)
      || question.correctAnswerIndex < 0
      || !Array.isArray(question.choices)
      || question.correctAnswerIndex >= question.choices.length
    ) {
      issues.push('correctAnswerIndex must be an integer within the choices range.');
    }

    return jsonResult({
      valid: issues.length === 0,
      questionId,
      issues,
    });
  },
);

await server.connect(new StdioServerTransport());
