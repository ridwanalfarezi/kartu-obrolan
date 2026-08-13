import assert from 'node:assert/strict';
import test from 'node:test';

import { MockLanguageModelV4 } from 'ai/test';

import { createQuestionGenerator } from '../src/question-generator.ts';

const tokenUsage = {
  inputTokens: {
    total: 20,
    noCache: 20,
    cacheRead: undefined,
    cacheWrite: undefined,
  },
  outputTokens: {
    total: 80,
    text: 80,
    reasoning: undefined,
  },
};

function modelReturning(value: unknown) {
  return new MockLanguageModelV4({
    doGenerate: async () => ({
      content: [{ type: 'text' as const, text: JSON.stringify(value) }],
      finishReason: { unified: 'stop' as const, raw: undefined },
      usage: tokenUsage,
      warnings: [],
    }),
  });
}

function modelReturningWithPromptCapture(
  value: unknown,
  capturePrompt: (prompt: string) => void,
) {
  return new MockLanguageModelV4({
    doGenerate: async options => {
      capturePrompt(JSON.stringify(options.prompt));
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(value) }],
        finishReason: { unified: 'stop' as const, raw: undefined },
        usage: tokenUsage,
        warnings: [],
      };
    },
  });
}

test('question package addresses every player without assuming a group size', async () => {
  const questions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan langsung nomor ${index + 1}?`,
  );
  let capturedPrompt = '';
  const generator = createQuestionGenerator({
    model: modelReturningWithPromptCapture({ questions }, prompt => {
      capturedPrompt = prompt;
    }),
  });

  await generator.generatePackage({ category: 'mixed', depth: 'casual' });

  assert.match(capturedPrompt, /dua orang atau lebih/i);
  assert.match(capturedPrompt, /langsung kepada seluruh pemain/i);
  assert.match(capturedPrompt, /jangan.*jumlah pemain/i);
  assert.match(capturedPrompt, /jangan.*sudut pandang orang pertama/i);
  assert.match(capturedPrompt, /gue.*aku.*saya/i);
  assert.doesNotMatch(capturedPrompt, /3[–-]8/);
});

test('hangout group receives a package of exactly 10 questions', async () => {
  const questions = [
    'Apa hal kecil yang selalu berhasil memperbaiki mood kamu?',
    'Kalau malam ini punya tema, judulnya apa?',
    'Kebiasaan teman mana yang diam-diam kamu kagumi?',
    'Momen receh apa yang masih sering kamu ingat?',
    'Kalau bisa mengulang satu hari, hari apa yang kamu pilih?',
    'Siapa di sini yang paling mungkin tersesat saat liburan?',
    'Hal spontan terbaik apa yang pernah kamu lakukan?',
    'Apa pendapatmu yang paling tidak populer soal makanan?',
    'Kalau hidupmu sebuah film, genrenya apa?',
    'Pertanyaan apa yang sebenarnya ingin kamu tanyakan malam ini?',
  ];
  const generator = createQuestionGenerator({
    model: modelReturning({ questions }),
  });

  const result = await generator.generatePackage({
    category: 'mixed',
    depth: 'casual',
  });

  assert.deepEqual(result, { questions });
});

test('question package with fewer than 10 questions is rejected', async () => {
  const generator = createQuestionGenerator({
    model: modelReturning({
      questions: [
        'Pertanyaan 1?',
        'Pertanyaan 2?',
        'Pertanyaan 3?',
        'Pertanyaan 4?',
        'Pertanyaan 5?',
        'Pertanyaan 6?',
        'Pertanyaan 7?',
        'Pertanyaan 8?',
        'Pertanyaan 9?',
      ],
    }),
  });

  await assert.rejects(
    generator.generatePackage({ category: 'light', depth: 'casual' }),
  );
});

test('question package containing a blank question is rejected', async () => {
  const generator = createQuestionGenerator({
    model: modelReturning({
      questions: [
        'Pertanyaan 1?',
        'Pertanyaan 2?',
        'Pertanyaan 3?',
        'Pertanyaan 4?',
        'Pertanyaan 5?',
        '   ',
        'Pertanyaan 7?',
        'Pertanyaan 8?',
        'Pertanyaan 9?',
        'Pertanyaan 10?',
      ],
    }),
  });

  await assert.rejects(
    generator.generatePackage({ category: 'funny', depth: 'personal' }),
  );
});

test('question package containing duplicate questions is rejected', async () => {
  const generator = createQuestionGenerator({
    model: modelReturning({
      questions: [
        'Pertanyaan 1?',
        'Pertanyaan 2?',
        'Pertanyaan 3?',
        'Pertanyaan 4?',
        'Pertanyaan 5?',
        'Pertanyaan 6?',
        'Pertanyaan 7?',
        'Pertanyaan 8?',
        'Pertanyaan 9?',
        '  pertanyaan 1?  ',
      ],
    }),
  });

  await assert.rejects(
    generator.generatePackage({ category: 'reflective', depth: 'deep' }),
  );
});

test('hangout group can generate one replacement for the active package', async () => {
  const existingQuestions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan aktif nomor ${index + 1}?`,
  );
  const generator = createQuestionGenerator({
    model: modelReturning({
      question: 'Kalau pertemanan kalian punya soundtrack, lagu apa yang wajib masuk?',
    }),
  });

  const result = await generator.generateReplacement({
    category: 'mixed',
    depth: 'personal',
    existingQuestions,
  });

  assert.deepEqual(result, {
    question: 'Kalau pertemanan kalian punya soundtrack, lagu apa yang wajib masuk?',
  });
});

test('replacement addresses every player without creating a narrator role', async () => {
  const existingQuestions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan aktif nomor ${index + 1}?`,
  );
  let capturedPrompt = '';
  const generator = createQuestionGenerator({
    model: modelReturningWithPromptCapture(
      { question: 'Apa hal baru yang ingin kalian coba bersama?' },
      prompt => {
        capturedPrompt = prompt;
      },
    ),
  });

  await generator.generateReplacement({
    category: 'mixed',
    depth: 'personal',
    existingQuestions,
  });

  assert.match(capturedPrompt, /dua orang atau lebih/i);
  assert.match(capturedPrompt, /langsung kepada seluruh pemain/i);
  assert.match(capturedPrompt, /jangan.*jumlah pemain/i);
  assert.match(capturedPrompt, /jangan.*sudut pandang orang pertama/i);
  assert.match(capturedPrompt, /gue.*aku.*saya/i);
});

test('replacement matching an active question is rejected', async () => {
  const existingQuestions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan aktif nomor ${index + 1}?`,
  );
  const generator = createQuestionGenerator({
    model: modelReturning({ question: '  pertanyaan aktif nomor 1?  ' }),
  });

  await assert.rejects(
    generator.generateReplacement({
      category: 'mixed',
      depth: 'personal',
      existingQuestions,
    }),
  );
});
