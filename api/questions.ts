import type { VercelRequest, VercelResponse } from '@vercel/node';

import {
  generateQuestionPackage,
  InvalidGeneratePackageInput,
  parseGeneratePackageInput,
} from '../src/server/generate-question-package.js';

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
    const input = parseGeneratePackageInput(request.body);
    const questionPackage = await generateQuestionPackage(input);
    response.status(200).json(questionPackage);
  } catch (error) {
    if (error instanceof InvalidGeneratePackageInput) {
      response
        .status(400)
        .json({ error: 'Kategori atau kedalaman belum valid.' } satisfies ErrorResponse);
      return;
    }

    console.error('Question package generation failed.', error);
    response.status(502).json({
      error: 'Pertanyaan belum berhasil dibuat. Silakan coba lagi.',
    } satisfies ErrorResponse);
  }
}
