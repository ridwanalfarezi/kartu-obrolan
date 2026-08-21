import { normalizeQuestion } from './question-novelty.ts';

const QUESTION_HISTORY_KEY = 'kartu-obrolan:question-history:v1';
export const QUESTION_HISTORY_LIMIT = 200;
export const QUESTION_HISTORY_RETENTION_MS = 30 * 24 * 60 * 60 * 1_000;

interface QuestionHistoryEntry {
  question: string;
  acceptedAt: number;
}

interface QuestionHistoryOptions {
  storage?: Storage;
  now?: number;
}

function resolveStorage(storage?: Storage): Storage | null {
  if (storage) return storage;
  return typeof globalThis.localStorage === 'undefined'
    ? null
    : globalThis.localStorage;
}

function readEntries(storage: Storage): QuestionHistoryEntry[] {
  try {
    const value: unknown = JSON.parse(
      storage.getItem(QUESTION_HISTORY_KEY) ?? '[]',
    );
    if (!Array.isArray(value)) return [];

    return value.filter(
      (entry): entry is QuestionHistoryEntry =>
        typeof entry === 'object' &&
        entry !== null &&
        'question' in entry &&
        typeof entry.question === 'string' &&
        entry.question.trim().length > 0 &&
        'acceptedAt' in entry &&
        typeof entry.acceptedAt === 'number' &&
        Number.isFinite(entry.acceptedAt),
    );
  } catch {
    return [];
  }
}

export function getQuestionHistory({
  storage: requestedStorage,
  now = Date.now(),
}: QuestionHistoryOptions = {}): string[] {
  const storage = resolveStorage(requestedStorage);
  if (!storage) return [];
  const entries = readEntries(storage);
  const activeEntries = entries.filter(
    entry => now - entry.acceptedAt <= QUESTION_HISTORY_RETENTION_MS,
  );

  if (activeEntries.length !== entries.length) {
    try {
      storage.setItem(QUESTION_HISTORY_KEY, JSON.stringify(activeEntries));
    } catch {
      // Expiry cleanup is best effort and never blocks the app.
    }
  }

  return activeEntries.map(entry => entry.question);
}

export function rememberAcceptedQuestions(
  questions: string[],
  {
    storage: requestedStorage,
    now = Date.now(),
  }: QuestionHistoryOptions = {},
): void {
  const storage = resolveStorage(requestedStorage);
  if (!storage) return;

  const activeEntries = readEntries(storage).filter(
    entry => now - entry.acceptedAt <= QUESTION_HISTORY_RETENTION_MS,
  );
  const combinedEntries = [
    ...activeEntries,
    ...questions
      .filter(question => question.trim().length > 0)
      .map(question => ({ question: question.trim(), acceptedAt: now })),
  ];
  const seenQuestions = new Set<string>();
  const nextEntries = [...combinedEntries]
    .reverse()
    .filter(entry => {
      const normalized = normalizeQuestion(entry.question);
      if (seenQuestions.has(normalized)) return false;
      seenQuestions.add(normalized);
      return true;
    })
    .reverse()
    .slice(-QUESTION_HISTORY_LIMIT);

  try {
    storage.setItem(QUESTION_HISTORY_KEY, JSON.stringify(nextEntries));
  } catch {
    // Question novelty must never block the conversation flow.
  }
}

export function resetQuestionHistory({
  storage: requestedStorage,
}: QuestionHistoryOptions = {}): boolean {
  const storage = resolveStorage(requestedStorage);
  if (!storage) return false;

  try {
    storage.removeItem(QUESTION_HISTORY_KEY);
    return true;
  } catch {
    return false;
  }
}
