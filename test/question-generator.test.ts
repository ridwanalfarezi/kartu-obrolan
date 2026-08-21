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

test('two-player package instructions require exactly two player-neutral participants', async () => {
  const questions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan untuk berdua nomor ${index + 1}?`,
  );
  let capturedPrompt = '';
  const generator = createQuestionGenerator({
    model: modelReturningWithPromptCapture({ questions }, prompt => {
      capturedPrompt = prompt;
    }),
  });

  await generator.generatePackage({
    category: 'mixed',
    depth: 'casual',
    playerCount: 2,
  });

  assert.match(capturedPrompt, /tepat 2 pemain/i);
  assert.match(capturedPrompt, /tiga orang atau lebih/i);
  assert.match(capturedPrompt, /seluruh pemain/i);
  assert.match(capturedPrompt, /bacakan.*tanyakan.*pilih tiga orang.*tunjuk teman/i);
  assert.match(capturedPrompt, /pembaca.*host.*fasilitator/i);
  assert.match(capturedPrompt, /gue.*aku.*saya.*kami/i);
});

test('two-player package rejects a question that requires three people', async () => {
  const questions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan untuk berdua nomor ${index + 1}?`,
  );
  questions[4] = 'Pilih tiga teman yang paling cocok diajak liburan.';
  const generator = createQuestionGenerator({
    model: modelReturning({ questions }),
  });

  await assert.rejects(
    generator.generatePackage({
      category: 'mixed',
      depth: 'casual',
      playerCount: 2,
    }),
  );
});

test('package rejects affixed facilitator instructions', async () => {
  const questions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan netral nomor ${index + 1}?`,
  );
  questions[4] =
    'Pilihlah satu teman untuk membacakan pertanyaan ini kepada yang lain.';
  const generator = createQuestionGenerator({
    model: modelReturning({ questions }),
  });

  await assert.rejects(
    generator.generatePackage({
      category: 'mixed',
      depth: 'casual',
      playerCount: 4,
    }),
  );
});

test('replacement rejects an affixed facilitator instruction', async () => {
  const existingQuestions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan aktif nomor ${index + 1}?`,
  );
  const generator = createQuestionGenerator({
    model: modelReturning({
      question: 'Tanyakanlah pertanyaan ini secara bergiliran.',
    }),
  });

  await assert.rejects(
    generator.generateReplacement({
      category: 'mixed',
      depth: 'personal',
      playerCount: 4,
      existingQuestions,
    }),
  );
});

test('package accepts quoted first-person speech from a player', async () => {
  const questions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan netral nomor ${index + 1}?`,
  );
  questions[4] = 'Kapan terakhir kali kamu mengatakan “aku sayang kamu”?';
  const generator = createQuestionGenerator({
    model: modelReturning({ questions }),
  });

  const result = await generator.generatePackage({
    category: 'mixed',
    depth: 'personal',
    playerCount: 4,
  });

  assert.deepEqual(result, { questions });
});

test('replacement accepts quoted first-person speech from a player', async () => {
  const existingQuestions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan aktif nomor ${index + 1}?`,
  );
  const question = 'Kapan terakhir kali kamu mengatakan “aku sayang kamu”?';
  const generator = createQuestionGenerator({
    model: modelReturning({ question }),
  });

  const result = await generator.generateReplacement({
    category: 'mixed',
    depth: 'personal',
    playerCount: 4,
    existingQuestions,
  });

  assert.deepEqual(result, { question });
});

test('replacement accepts collective exact-count choice wording', async () => {
  const existingQuestions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan aktif nomor ${index + 1}?`,
  );
  const question =
    'Kalau kalian harus pilih empat pemain untuk satu tim, kekuatan apa yang wajib ada?';
  const generator = createQuestionGenerator({
    model: modelReturning({ question }),
  });

  const result = await generator.generateReplacement({
    category: 'mixed',
    depth: 'personal',
    playerCount: 4,
    existingQuestions,
  });

  assert.deepEqual(result, { question });
});

test('package still rejects first-person card narrator wording', async () => {
  const questions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan netral nomor ${index + 1}?`,
  );
  questions[4] = 'Apa hal dari gue yang kalian tidak suka?';
  const generator = createQuestionGenerator({
    model: modelReturning({ questions }),
  });

  await assert.rejects(
    generator.generatePackage({
      category: 'mixed',
      depth: 'personal',
      playerCount: 4,
    }),
  );
});

test('package rejects a first-person card narrator at the start', async () => {
  const questions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan netral nomor ${index + 1}?`,
  );
  questions[4] = 'Aku penasaran, siapa yang paling sulit kalian percaya?';
  const generator = createQuestionGenerator({
    model: modelReturning({ questions }),
  });

  await assert.rejects(
    generator.generatePackage({
      category: 'mixed',
      depth: 'personal',
      playerCount: 4,
    }),
  );
});

test('replacement rejects first-person card narrator suffix wording', async () => {
  const existingQuestions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan aktif nomor ${index + 1}?`,
  );
  const generator = createQuestionGenerator({
    model: modelReturning({
      question: 'Ceritakan padaku hal yang paling kalian syukuri.',
    }),
  });

  await assert.rejects(
    generator.generateReplacement({
      category: 'mixed',
      depth: 'personal',
      playerCount: 4,
      existingQuestions,
    }),
  );
});

test('package accepts role words used as an ordinary topic', async () => {
  const questions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan netral nomor ${index + 1}?`,
  );
  questions[4] = 'Siapa host podcast favorit kalian?';
  const generator = createQuestionGenerator({
    model: modelReturning({ questions }),
  });

  const result = await generator.generatePackage({
    category: 'mixed',
    depth: 'casual',
    playerCount: 4,
  });

  assert.deepEqual(result, { questions });
});

test('replacement accepts a people count that is not the current group size', async () => {
  const existingQuestions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan aktif nomor ${index + 1}?`,
  );
  const question = 'Siapa dua orang yang paling menginspirasimu?';
  const generator = createQuestionGenerator({
    model: modelReturning({ question }),
  });

  const result = await generator.generateReplacement({
    category: 'mixed',
    depth: 'personal',
    playerCount: 4,
    existingQuestions,
  });

  assert.deepEqual(result, { question });
});

test('two-player package rejects a larger count before the current-group reference', async () => {
  const questions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan untuk berdua nomor ${index + 1}?`,
  );
  questions[4] =
    'Pilih empat pemain dari sesi ini untuk menjawab secara bergiliran.';
  const generator = createQuestionGenerator({
    model: modelReturning({ questions }),
  });

  await assert.rejects(
    generator.generatePackage({
      category: 'mixed',
      depth: 'personal',
      playerCount: 2,
    }),
  );
});

test('replacement rejects a mismatched count before the current-group reference', async () => {
  const existingQuestions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan aktif nomor ${index + 1}?`,
  );
  const generator = createQuestionGenerator({
    model: modelReturning({
      question: 'Tiga pemain dari kelompok ini menjawab secara bergiliran.',
    }),
  });

  await assert.rejects(
    generator.generateReplacement({
      category: 'mixed',
      depth: 'personal',
      playerCount: 4,
      existingQuestions,
    }),
  );
});

test('two-player package rejects the berdua belas group-size form', async () => {
  const questions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan untuk berdua nomor ${index + 1}?`,
  );
  questions[6] = 'Kalau kalian berdua belas membuka usaha, siapa mengurus apa?';
  const generator = createQuestionGenerator({
    model: modelReturning({ questions }),
  });

  await assert.rejects(
    generator.generatePackage({
      category: 'mixed',
      depth: 'personal',
      playerCount: 2,
    }),
  );
});

test('twelve-player package accepts the berdua belas group-size form', async () => {
  const questions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan untuk kelompok nomor ${index + 1}?`,
  );
  questions[6] = 'Kalau kalian berdua belas membuka usaha, siapa mengurus apa?';
  const generator = createQuestionGenerator({
    model: modelReturning({ questions }),
  });

  const result = await generator.generatePackage({
    category: 'mixed',
    depth: 'personal',
    playerCount: 12,
  });

  assert.deepEqual(result, { questions });
});

test('twelve-player replacement accepts the berdua belas group-size form', async () => {
  const existingQuestions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan aktif nomor ${index + 1}?`,
  );
  const question = 'Kalau kalian berdua belas membuka usaha, siapa mengurus apa?';
  const generator = createQuestionGenerator({
    model: modelReturning({ question }),
  });

  const result = await generator.generateReplacement({
    category: 'mixed',
    depth: 'personal',
    playerCount: 12,
    existingQuestions,
  });

  assert.deepEqual(result, { question });
});

test('replacement rejects berdua belas for another selected count', async () => {
  const existingQuestions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan aktif nomor ${index + 1}?`,
  );
  const generator = createQuestionGenerator({
    model: modelReturning({
      question: 'Kalau kalian berdua belas membuka usaha, siapa mengurus apa?',
    }),
  });

  await assert.rejects(
    generator.generateReplacement({
      category: 'mixed',
      depth: 'personal',
      playerCount: 4,
      existingQuestions,
    }),
  );
});

test('replacement rejects an Indonesian group-size form that differs from the selected count', async () => {
  const existingQuestions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan aktif nomor ${index + 1}?`,
  );
  const generator = createQuestionGenerator({
    model: modelReturning({
      question: 'Kalau kalian bersebelas membuka usaha, siapa mengurus apa?',
    }),
  });

  await assert.rejects(
    generator.generateReplacement({
      category: 'mixed',
      depth: 'personal',
      playerCount: 12,
      existingQuestions,
    }),
  );
});

test('package rejects an explicit group size that differs from the selected count', async () => {
  const questions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan untuk berlima nomor ${index + 1}?`,
  );
  questions[7] = 'Kalau kalian bertiga membuka usaha, siapa mengurus apa?';
  const generator = createQuestionGenerator({
    model: modelReturning({ questions }),
  });

  await assert.rejects(
    generator.generatePackage({
      category: 'mixed',
      depth: 'personal',
      playerCount: 5,
    }),
  );
});

test('replacement instructions retain the exact player count', async () => {
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
    playerCount: 5,
    existingQuestions,
  });

  assert.match(capturedPrompt, /tepat 5 pemain/i);
});

test('question package addresses every player for the selected group size', async () => {
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

  await generator.generatePackage({
    category: 'mixed',
    depth: 'casual',
    playerCount: 4,
  });

  assert.match(capturedPrompt, /tepat 4 pemain/i);
  assert.match(capturedPrompt, /seluruh pemain/i);
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
    'Pertanyaan apa yang paling ingin kamu dengar jawabannya malam ini?',
  ];
  const generator = createQuestionGenerator({
    model: modelReturning({ questions }),
  });

  const result = await generator.generatePackage({
    category: 'mixed',
    depth: 'casual',
    playerCount: 4,
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
    generator.generatePackage({
      category: 'light',
      depth: 'casual',
      playerCount: 4,
    }),
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
    generator.generatePackage({
      category: 'funny',
      depth: 'personal',
      playerCount: 4,
    }),
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
    generator.generatePackage({
      category: 'reflective',
      depth: 'deep',
      playerCount: 4,
    }),
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
    playerCount: 4,
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
    playerCount: 4,
    existingQuestions,
  });

  assert.match(capturedPrompt, /tepat 4 pemain/i);
  assert.match(capturedPrompt, /seluruh pemain/i);
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
      playerCount: 4,
      existingQuestions,
    }),
  );
});
