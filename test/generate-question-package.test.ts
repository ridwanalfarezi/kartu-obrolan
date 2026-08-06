import assert from 'node:assert/strict';
import test from 'node:test';

import {
  InvalidGeneratePackageInput,
  parseGeneratePackageInput,
  parseGenerateReplacementInput,
} from '../src/server/generate-question-package.ts';

test('valid category and depth are accepted by the server boundary', () => {
  assert.deepEqual(
    parseGeneratePackageInput({ category: 'mixed', depth: 'personal' }),
    { category: 'mixed', depth: 'personal', explorative: true },
  );
  assert.deepEqual(
    parseGeneratePackageInput({ category: 'light', depth: 'casual', explorative: false }),
    { category: 'light', depth: 'casual', explorative: false },
  );
});

test('unsupported category is rejected by the server boundary', () => {
  assert.throws(
    () => parseGeneratePackageInput({ category: 'random', depth: 'personal' }),
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
      existingQuestions,
    }),
    { category: 'funny', depth: 'deep', explorative: true, existingQuestions },
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
        existingQuestions,
      }),
    InvalidGeneratePackageInput,
  );
});
