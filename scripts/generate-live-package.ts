import { google } from '@ai-sdk/google';

import { createQuestionGenerator } from '../src/question-generator.ts';

const model = 'gemini-3.5-flash-lite';
const generator = createQuestionGenerator({ model: google(model) });
const startedAt = performance.now();

try {
  const questionPackage = await generator.generatePackage({
    category: 'mixed',
    depth: 'personal',
  });

  console.log(
    JSON.stringify(
      {
        model,
        latencyMs: Math.round(performance.now() - startedAt),
        questionPackage,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(
    JSON.stringify({
      model,
      latencyMs: Math.round(performance.now() - startedAt),
      error: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exitCode = 1;
}
