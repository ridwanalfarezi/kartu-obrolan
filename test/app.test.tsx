import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { App } from '../src/App.tsx';

const questions = Array.from(
  { length: 10 },
  (_, index) => `Pertanyaan hangout nomor ${index + 1}?`,
);

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('conversation session start flow', () => {
  test('starts without an account and opens session setup', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText(/tanpa akun/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /mulai sesi/i }));

    expect(
      screen.getByRole('heading', { name: /mau ngobrol tentang apa/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Campur/)).toBeChecked();
    expect(screen.getByLabelText(/^Personal/)).toBeChecked();
  });

  test('sets clear expectations for explorative mode before generation', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /mulai sesi/i }));

    expect(
      screen.getByText(/topik dewasa, sensitif, atau kontroversial/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/selalu boleh melewati/i)).toBeInTheDocument();
  });

  test('requests a validated package and shows its first question', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
        return { questions };
      },
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /mulai sesi/i }));
    await user.click(screen.getByLabelText(/^Lucu/));
    await user.click(screen.getByLabelText(/^Mendalam/));
    await user.click(
      screen.getByRole('button', { name: /buat pertanyaan/i }),
    );

    expect(
      screen.getByRole('heading', { name: /lagi menyiapkan pertanyaan/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText(questions[0])).toBeInTheDocument();
    expect(screen.getByText('1 dari 10')).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/questions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ category: 'funny', depth: 'deep' }),
        }),
      );
    });
  });

  test('does not admit a malformed package into the session', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ questions: questions.slice(0, 9) }),
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /mulai sesi/i }));
    await user.click(
      screen.getByRole('button', { name: /buat pertanyaan/i }),
    );

    expect(
      await screen.findByRole('heading', {
        name: /pertanyaan belum berhasil dibuat/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /coba lagi/i }),
    ).toBeInTheDocument();
  });

  test('retries a failed initial generation with the same session choices', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Network unavailable'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => {
          await new Promise(resolve => setTimeout(resolve, 20));
          return { questions };
        },
      });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /mulai sesi/i }));
    await user.click(screen.getByLabelText(/^Lucu/));
    await user.click(screen.getByLabelText(/^Mendalam/));
    await user.click(
      screen.getByRole('button', { name: /buat pertanyaan/i }),
    );

    expect(
      await screen.findByRole('heading', {
        name: /pertanyaan belum berhasil dibuat/i,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(questions[0])).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: /pertanyaan 1 dari 10/i }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /coba lagi/i }));

    expect(
      screen.getByRole('heading', { name: /lagi menyiapkan pertanyaan/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText(questions[0])).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/questions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ category: 'funny', depth: 'deep' }),
      }),
    );
  });

  test('advances to the next unused question and updates progress', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ questions }),
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /mulai sesi/i }));
    await user.click(
      screen.getByRole('button', { name: /buat pertanyaan/i }),
    );
    expect(await screen.findByText(questions[0])).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /pertanyaan berikutnya/i }),
    );

    expect(screen.getByText(questions[1])).toBeInTheDocument();
    expect(screen.getByText('2 dari 10')).toBeInTheDocument();
  });

  test('skips the current question and advances to the next card', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ questions }),
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /mulai sesi/i }));
    await user.click(
      screen.getByRole('button', { name: /buat pertanyaan/i }),
    );
    expect(await screen.findByText(questions[0])).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^lewati$/i }));

    expect(screen.getByText(questions[1])).toBeInTheDocument();
    expect(screen.getByText('2 dari 10')).toBeInTheDocument();
  });

  test('finishes the temporary session after the tenth question', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ questions }),
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /mulai sesi/i }));
    await user.click(
      screen.getByRole('button', { name: /buat pertanyaan/i }),
    );
    expect(await screen.findByText(questions[0])).toBeInTheDocument();

    for (let index = 1; index < questions.length; index += 1) {
      await user.click(
        screen.getByRole('button', { name: /pertanyaan berikutnya/i }),
      );
    }

    expect(screen.getByText(questions[9])).toBeInTheDocument();
    expect(screen.getByText('10 dari 10')).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: /selesaikan sesi/i }),
    );

    expect(
      screen.getByRole('heading', { name: /sesi selesai/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/tidak ada riwayat yang disimpan/i)).toBeInTheDocument();
  });

  test('skipping the tenth question also finishes the session', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ questions }),
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /mulai sesi/i }));
    await user.click(
      screen.getByRole('button', { name: /buat pertanyaan/i }),
    );
    expect(await screen.findByText(questions[0])).toBeInTheDocument();

    for (let index = 1; index < questions.length; index += 1) {
      await user.click(
        screen.getByRole('button', { name: /pertanyaan berikutnya/i }),
      );
    }
    await user.click(screen.getByRole('button', { name: /^lewati$/i }));

    expect(
      screen.getByRole('heading', { name: /sesi selesai/i }),
    ).toBeInTheDocument();
  });

  test('regenerates only the current question and keeps session progress', async () => {
    const replacement = 'Cerita apa yang selalu bikin kelompok ini tertawa lagi?';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ questions }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => {
          await new Promise(resolve => setTimeout(resolve, 20));
          return { question: replacement };
        },
      });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /mulai sesi/i }));
    await user.click(
      screen.getByRole('button', { name: /buat pertanyaan/i }),
    );
    expect(await screen.findByText(questions[0])).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /buat ulang/i }));

    expect(
      screen.getByRole('button', { name: /membuat ulang/i }),
    ).toBeDisabled();
    expect(await screen.findByText(replacement)).toBeInTheDocument();
    expect(screen.getByText('1 dari 10')).toBeInTheDocument();
    expect(screen.queryByText(questions[0])).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/question-replacement',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          category: 'mixed',
          depth: 'personal',
          existingQuestions: questions,
        }),
      }),
    );
  });

  test('keeps the active package and retries a failed regeneration', async () => {
    const replacement = 'Siapa yang paling mungkin membuat rencana dadakan?';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ questions }),
      })
      .mockRejectedValueOnce(new TypeError('Network unavailable'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => {
          await new Promise(resolve => setTimeout(resolve, 20));
          return { question: replacement };
        },
      });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /mulai sesi/i }));
    await user.click(
      screen.getByRole('button', { name: /buat pertanyaan/i }),
    );
    expect(await screen.findByText(questions[0])).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /buat ulang/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /belum berhasil dibuat ulang/i,
    );
    expect(screen.getByText(questions[0])).toBeInTheDocument();
    expect(screen.getByText('1 dari 10')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /coba lagi/i }));

    expect(
      screen.getByRole('button', { name: /membuat ulang/i }),
    ).toBeDisabled();
    expect(await screen.findByText(replacement)).toBeInTheDocument();
    expect(screen.getByText('1 dari 10')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/question-replacement',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          category: 'mixed',
          depth: 'personal',
          existingQuestions: questions,
        }),
      }),
    );
  });

  test('uses the regeneration recovery flow for an invalid AI response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ questions }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ question: questions[0] }),
      });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /mulai sesi/i }));
    await user.click(
      screen.getByRole('button', { name: /buat pertanyaan/i }),
    );
    expect(await screen.findByText(questions[0])).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /buat ulang/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /belum berhasil dibuat ulang/i,
    );
    expect(screen.getByText(questions[0])).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /coba lagi/i }),
    ).toBeInTheDocument();
  });

  test('complete screen shows session summary with skip count', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ questions }),
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /mulai sesi/i }));
    await user.click(
      screen.getByRole('button', { name: /buat pertanyaan/i }),
    );
    expect(await screen.findByText(questions[0])).toBeInTheDocument();

    // Skip questions 1 and 2
    await user.click(screen.getByRole('button', { name: /^lewati$/i }));
    await user.click(screen.getByRole('button', { name: /^lewati$/i }));

    // Advance through the rest with "Pertanyaan berikutnya"
    for (let index = 3; index < questions.length; index += 1) {
      await user.click(
        screen.getByRole('button', { name: /pertanyaan berikutnya/i }),
      );
    }
    await user.click(
      screen.getByRole('button', { name: /selesaikan sesi/i }),
    );

    expect(
      screen.getByRole('heading', { name: /sesi selesai/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/2 dilewati/i)).toBeInTheDocument();
    expect(screen.getByText(/tidak ada riwayat yang disimpan/i)).toBeInTheDocument();
  });
});

