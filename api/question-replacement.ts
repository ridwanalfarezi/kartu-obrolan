import type { VercelRequest, VercelResponse } from '@vercel/node';

import {
  generateQuestionReplacement,
  InvalidGeneratePackageInput,
  parseGenerateReplacementInput,
} from '../src/server/generate-question-package.ts';

type ErrorResponse = { error: string };

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Metode permintaan tidak didukung.' });
    return;
  }

  try {
    const input = parseGenerateReplacementInput(request.body);
    const replacement = await generateQuestionReplacement(input);
    response.status(200).json(replacement);
  } catch (error) {
    if (error instanceof InvalidGeneratePackageInput) {
      response.status(400).json({
        error: 'Konteks pertanyaan belum valid.',
      } satisfies ErrorResponse);
      return;
    }

    console.error('Question replacement generation failed.', error);
    response.status(502).json({
      error: 'Pertanyaan belum berhasil dibuat ulang. Silakan coba lagi.',
    } satisfies ErrorResponse);
  }
}
