import type { IncomingMessage, ServerResponse } from 'node:http';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import {
  generateQuestionPackage,
  generateQuestionReplacement,
  InvalidGeneratePackageInput,
  parseGeneratePackageInput,
  parseGenerateReplacementInput,
} from './src/server/generate-question-package.ts';

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  body: unknown,
): void {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(body));
}

function localQuestionApi(): Plugin {
  return {
    name: 'local-question-api',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = request.url?.split('?')[0];
        if (
          pathname !== '/api/questions' &&
          pathname !== '/api/question-replacement'
        ) {
          next();
          return;
        }

        if (request.method !== 'POST') {
          response.setHeader('Allow', 'POST');
          sendJson(response, 405, { error: 'Metode permintaan tidak didukung.' });
          return;
        }

        try {
          const body = await readJsonBody(request);

          if (pathname === '/api/question-replacement') {
            const input = parseGenerateReplacementInput(body);
            sendJson(response, 200, await generateQuestionReplacement(input));
            return;
          }

          const input = parseGeneratePackageInput(body);
          sendJson(response, 200, await generateQuestionPackage(input));
        } catch (error) {
          if (
            error instanceof InvalidGeneratePackageInput ||
            error instanceof SyntaxError
          ) {
            sendJson(response, 400, {
              error: 'Kategori atau kedalaman belum valid.',
            });
            return;
          }

          console.error('Local question package generation failed.', error);
          sendJson(response, 502, {
            error: 'Pertanyaan belum berhasil dibuat. Silakan coba lagi.',
          });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ??=
    env.GOOGLE_GENERATIVE_AI_API_KEY;

  return {
    plugins: [
      react(),
      localQuestionApi(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'favicon.svg',
          'apple-touch-icon-180x180.png',
        ],
        manifest: {
          id: '/',
          name: 'Kartu Obrolan',
          short_name: 'Kartu Obrolan',
          description: 'Pemantik obrolan berbasis AI untuk hangout bersama.',
          lang: 'id',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#251153',
          theme_color: '#251153',
          categories: ['entertainment', 'lifestyle'],
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          navigateFallback: '/index.html',
        },
      }),
    ],
  };
});
