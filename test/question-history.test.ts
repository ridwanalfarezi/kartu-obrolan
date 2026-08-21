import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getQuestionHistory,
  rememberAcceptedQuestions,
  resetQuestionHistory,
} from '../src/question-history.ts';
import {
  calculateQuestionSimilarity,
  normalizeQuestion,
} from '../src/question-novelty.ts';

function createMemoryStorage(): Storage {
  let store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store = new Map();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

test('accepted questions are available to the next conversation session', () => {
  const storage = createMemoryStorage();

  rememberAcceptedQuestions(
    ['Apa keputusan terbesar yang pernah kamu sesali?'],
    { storage, now: 1_000 },
  );

  assert.deepEqual(getQuestionHistory({ storage, now: 1_000 }), [
    'Apa keputusan terbesar yang pernah kamu sesali?',
  ]);
});

test('questions expire after 30 days', () => {
  const storage = createMemoryStorage();
  const thirtyDays = 30 * 24 * 60 * 60 * 1_000;

  rememberAcceptedQuestions(['Pertanyaan lama?'], { storage, now: 1_000 });

  assert.deepEqual(
    getQuestionHistory({ storage, now: 1_000 + thirtyDays + 1 }),
    [],
  );
});

test('history keeps only the newest 200 accepted questions', () => {
  const storage = createMemoryStorage();
  const questions = Array.from(
    { length: 205 },
    (_, index) => `Pertanyaan nomor ${index + 1}?`,
  );

  rememberAcceptedQuestions(questions, { storage, now: 1_000 });

  const history = getQuestionHistory({ storage, now: 1_000 });
  assert.equal(history.length, 200);
  assert.equal(history[0], 'Pertanyaan nomor 6?');
  assert.equal(history[199], 'Pertanyaan nomor 205?');
});

test('reset removes question history without clearing unrelated device data', () => {
  const storage = createMemoryStorage();
  storage.setItem('kartu-obrolan:session-count', '3');
  rememberAcceptedQuestions(['Pertanyaan baru?'], { storage, now: 1_000 });

  resetQuestionHistory({ storage });

  assert.deepEqual(getQuestionHistory({ storage, now: 1_000 }), []);
  assert.equal(storage.getItem('kartu-obrolan:session-count'), '3');
});

test('exact comparison ignores case, punctuation, and repeated whitespace', () => {
  assert.equal(
    normalizeQuestion('  APA, keputusanmu?!  '),
    normalizeQuestion('apa keputusanmu'),
  );
});

test('topic similarity catches a regret paraphrase without rejecting a different topic', () => {
  const original = 'Apa keputusan terbesar yang pernah kamu sesali?';
  const paraphrase =
    'Keputusan apa dalam hidup yang paling membuatmu menyesal?';
  const differentTopic = 'Makanan apa yang selalu ingin kamu pesan saat hujan?';

  assert.ok(calculateQuestionSimilarity(original, paraphrase) >= 0.75);
  assert.ok(calculateQuestionSimilarity(original, differentTopic) < 0.75);
});
