import assert from 'node:assert/strict';
import test from 'node:test';

import {
  InvalidGeneratePackageInput,
  parseGeneratePackageInput,
  parseGenerateReplacementInput,
} from '../src/server/generate-question-package.ts';

test('valid session settings include an exact supported player count', () => {
  assert.deepEqual(
    parseGeneratePackageInput({ category: 'mixed', depth: 'personal', playerCount: 4 }),
    { category: 'mixed', depth: 'personal', playerCount: 4, explorative: true },
  );
  assert.deepEqual(
    parseGeneratePackageInput({ category: 'light', depth: 'casual', playerCount: 2, explorative: false }),
    { category: 'light', depth: 'casual', playerCount: 2, explorative: false },
  );
});

test('missing or unsupported player counts are rejected by the server boundary', () => {
  for (const playerCount of [undefined, 1, 2.5, 13, '4']) {
    assert.throws(
      () => parseGeneratePackageInput({ category: 'mixed', depth: 'personal', playerCount }),
      InvalidGeneratePackageInput,
    );
  }
});

test('unsupported category is rejected by the server boundary', () => {
  assert.throws(
    () =>
      parseGeneratePackageInput({
        category: 'random',
        depth: 'personal',
        playerCount: 4,
      }),
    InvalidGeneratePackageInput,
  );
});

test('replacement boundary accepts active package context', () => {
  const existingQuestions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan aktif nomor ${index + 1}?`,
  );

  assert.deepEqual(
    parseGenerateReplacementInput({
      category: 'funny',
      depth: 'deep',
      playerCount: 6,
      existingQuestions,
    }),
    { category: 'funny', depth: 'deep', playerCount: 6, explorative: true, existingQuestions },
  );
});

test('replacement boundary rejects a package with duplicate questions', () => {
  const existingQuestions = Array.from(
    { length: 10 },
    (_, index) => `Pertanyaan aktif nomor ${index + 1}?`,
  );
  existingQuestions[9] = existingQuestions[0];

  assert.throws(
    () =>
      parseGenerateReplacementInput({
        category: 'mixed',
        depth: 'personal',
        playerCount: 4,
        existingQuestions,
      }),
    InvalidGeneratePackageInput,
  );
});
