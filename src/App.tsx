import { useEffect, useRef, useState } from 'react';

import {
  createSessionAnalytics,
  type SessionAnalytics,
} from './analytics.ts';
import type {
  Category,
  Depth,
  QuestionPackage,
} from './question-generator.ts';

type View = 'home' | 'setup' | 'loading' | 'question' | 'complete' | 'error';

const categoryOptions: ReadonlyArray<{
  value: Category;
  label: string;
  description: string;
}> = [
  {
    value: 'light',
    label: 'Ringan',
    description: 'Santai & tidak memeras otak.',
  },
  {
    value: 'funny',
    label: 'Lucu',
    description: 'Momen kocak & cerita humor.',
  },
  {
    value: 'experience',
    label: 'Cerita hidup',
    description: 'Nostalgia & pengalaman unik.',
  },
  {
    value: 'reflective',
    label: 'Reflektif',
    description: 'Perspektif & pandangan diri.',
  },
  {
    value: 'mixed',
    label: 'Campur',
    description: 'Kombinasi acak berbagai topik.',
  },
];

const depthOptions: ReadonlyArray<{
  value: Depth;
  label: string;
  description: string;
}> = [
  {
    value: 'casual',
    label: 'Santai',
    description: 'Ringan, cepat, dan mudah dijawab.',
  },
  {
    value: 'personal',
    label: 'Personal',
    description: 'Lebih dekat dan sedikit lebih jujur.',
  },
  {
    value: 'deep',
    label: 'Mendalam',
    description: 'Menggali cerita, makna, dan nilai.',
  },
];

const loadingTips = [
  'Tip: Tidak ada jawaban yang salah, nikmati obrolannya.',
  'Tip: Dengarkan dulu sampai selesai sebelum menanggapi.',
  'Tip: Kamu selalu boleh memilih melewati pertanyaan kapan saja.',
  'Tip: Pertanyaan dibuat khusus berdasarkan kategori pilihan kelompokmu.',
];

function isQuestionPackage(value: unknown): value is QuestionPackage {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('questions' in value) ||
    !Array.isArray(value.questions) ||
    value.questions.length !== 10
  ) {
    return false;
  }

  const questions = value.questions;
  if (
    !questions.every(
      question => typeof question === 'string' && question.trim().length > 0,
    )
  ) {
    return false;
  }

  const normalized = questions.map(question =>
    question.trim().toLocaleLowerCase('id-ID'),
  );
  return new Set(normalized).size === normalized.length;
}

function isQuestionReplacement(
  value: unknown,
  existingQuestions: string[],
): value is { question: string } {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('question' in value) ||
    typeof value.question !== 'string' ||
    value.question.trim().length === 0
  ) {
    return false;
  }

  const normalizedReplacement = value.question
    .trim()
    .toLocaleLowerCase('id-ID');
  return !existingQuestions.some(
    question =>
      question.trim().toLocaleLowerCase('id-ID') === normalizedReplacement,
  );
}

async function requestQuestionPackage(
  category: Category,
  depth: Depth,
  signal?: AbortSignal,
): Promise<QuestionPackage> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 95_000);

  const onAbort = () => controller.abort();
  if (signal) {
    signal.addEventListener('abort', onAbort);
  }

  let response: Response;
  try {
    response = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, depth }),
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
    if (signal) {
      signal.removeEventListener('abort', onAbort);
    }
  }

  if (!response.ok) {
    throw new Error('Question request failed.');
  }

  const value: unknown = await response.json();
  if (!isQuestionPackage(value)) {
    throw new Error('Question package was malformed.');
  }

  return value;
}

async function requestQuestionReplacement(
  category: Category,
  depth: Depth,
  existingQuestions: string[],
): Promise<string> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 95_000);

  let response: Response;
  try {
    response = await fetch('/api/question-replacement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, depth, existingQuestions }),
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error('Question replacement request failed.');
  }

  const value: unknown = await response.json();
  if (!isQuestionReplacement(value, existingQuestions)) {
    throw new Error('Question replacement was malformed or duplicated.');
  }

  return value.question.trim();
}

function TableMark({ compact = false }: { compact?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={compact ? 'table-mark table-mark--compact' : 'table-mark'}
    >
      <span className="table-mark__ring" />
      <span className="table-mark__person table-mark__person--one" />
      <span className="table-mark__person table-mark__person--two" />
      <span className="table-mark__person table-mark__person--three" />
      <span className="table-mark__card table-mark__card--back" />
      <span className="table-mark__card table-mark__card--front" />
    </div>
  );
}

function ProgressRail({ currentIndex }: { currentIndex: number }) {
  return (
    <div aria-hidden="true" className="progress-rail">
      {Array.from({ length: 10 }, (_, index) => (
        <span
          className={
            index <= currentIndex
              ? 'progress-rail__step is-active'
              : 'progress-rail__step'
          }
          key={index}
        />
      ))}
    </div>
  );
}

export function App() {
  const [view, setView] = useState<View>('home');
  const [category, setCategory] = useState<Category>('mixed');
  const [depth, setDepth] = useState<Depth>('personal');
  const [questionPackage, setQuestionPackage] =
    useState<QuestionPackage | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationFailed, setRegenerationFailed] = useState(false);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const analyticsRef = useRef<SessionAnalytics | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [currentQuestionIndex, questionPackage, view]);

  useEffect(() => {
    if (view === 'loading') {
      const interval = window.setInterval(() => {
        setTipIndex(prev => (prev + 1) % loadingTips.length);
      }, 4500);
      return () => window.clearInterval(interval);
    }
  }, [view]);

  async function startSession() {
    setView('loading');
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const nextPackage = await requestQuestionPackage(
        category,
        depth,
        controller.signal,
      );
      setQuestionPackage(nextPackage);
      setCurrentQuestionIndex(0);
      setSkipCount(0);
      setRegenerateCount(0);
      analyticsRef.current = createSessionAnalytics(category, depth);
      setView('question');
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setView('error');
    } finally {
      abortControllerRef.current = null;
    }
  }

  function cancelLoading() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setView('setup');
  }

  function resetSession() {
    setQuestionPackage(null);
    setCurrentQuestionIndex(0);
    setSkipCount(0);
    setRegenerateCount(0);
    setIsRegenerating(false);
    setRegenerationFailed(false);
    setIsConfirmingReset(false);
    analyticsRef.current = null;
    setView('home');
  }

  async function copyCurrentQuestion() {
    if (!questionPackage) return;
    const text = questionPackage.questions[currentQuestionIndex];
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  }

  async function regenerateCurrentQuestion() {
    if (!questionPackage) {
      return;
    }

    setRegenerationFailed(false);
    setIsRegenerating(true);
    try {
      const replacement = await requestQuestionReplacement(
        category,
        depth,
        questionPackage.questions,
      );
      setQuestionPackage(currentPackage => {
        if (!currentPackage) {
          return currentPackage;
        }

        const nextQuestions = [...currentPackage.questions];
        nextQuestions[currentQuestionIndex] = replacement;
        return { questions: nextQuestions };
      });
      setRegenerateCount(count => count + 1);
      analyticsRef.current?.recordRegenerate();
    } catch {
      setRegenerationFailed(true);
    } finally {
      setIsRegenerating(false);
    }
  }

  function previousQuestion() {
    setRegenerationFailed(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(index => index - 1);
    }
  }

  function skipQuestion() {
    setRegenerationFailed(false);
    setSkipCount(count => count + 1);
    analyticsRef.current?.recordSkip();

    if (isLastQuestion) {
      analyticsRef.current?.recordComplete();
      setView('complete');
      return;
    }

    setCurrentQuestionIndex(index => index + 1);
  }

  function advanceSession() {
    setRegenerationFailed(false);

    if (isLastQuestion) {
      analyticsRef.current?.recordComplete();
      setView('complete');
      return;
    }

    setCurrentQuestionIndex(index => index + 1);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartXRef.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0 && !isRegenerating) {
        advanceSession();
      } else if (deltaX > 0 && currentQuestionIndex > 0 && !isRegenerating) {
        previousQuestion();
      }
    }
  }

  const selectedCategory = categoryOptions.find(
    option => option.value === category,
  );
  const selectedDepth = depthOptions.find(option => option.value === depth);
  const isLastQuestion = currentQuestionIndex === 9;

  return (
    <div className={`app-frame app-frame--${view}`}>
      {view === 'home' && (
        <main className="home-screen screen-enter">
          <section className="home-screen__intro">
            <TableMark />
            <div className="home-screen__copy">
              <h1 ref={headingRef} tabIndex={-1}>
                Kartu
                <br />
                Obrolan
              </h1>
              <p>Obrolan seru dimulai dari satu pertanyaan.</p>
            </div>
          </section>

          <section className="home-screen__action" aria-label="Mulai sesi baru">
            <p>3–8 teman · satu ponsel · tanpa akun</p>
            <button
              className="button button--amber button--full"
              onClick={() => setView('setup')}
              type="button"
            >
              Mulai sesi
              <span aria-hidden="true">→</span>
            </button>
          </section>
        </main>
      )}

      {view === 'setup' && (
        <main className="setup-screen screen-enter">
          <header className="setup-screen__header">
            <button
              className="back-button"
              onClick={() => setView('home')}
              type="button"
            >
              <span aria-hidden="true">←</span>
              Kembali
            </button>
            <TableMark compact />
            <h1
              aria-label="Mau ngobrol tentang apa?"
              ref={headingRef}
              tabIndex={-1}
            >
              Mau ngobrol
              <br />
              tentang apa?
            </h1>
          </header>

          <form
            className="session-form"
            onSubmit={event => {
              event.preventDefault();
              void startSession();
            }}
          >
            <fieldset className="choice-group choice-group--category">
              <legend>Pilih kategori</legend>
              <div className="category-options">
                {categoryOptions.map(option => (
                  <label className="category-option" key={option.value}>
                    <input
                      checked={category === option.value}
                      name="category"
                      onChange={() => setCategory(option.value)}
                      type="radio"
                      value={option.value}
                    />
                    <span className="category-option__copy">
                      <strong>{option.label}</strong>
                      <small>{option.description}</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="choice-group choice-group--depth">
              <legend>Pilih kedalaman</legend>
              <div className="depth-options">
                {depthOptions.map(option => (
                  <label className="depth-option" key={option.value}>
                    <input
                      checked={depth === option.value}
                      name="depth"
                      onChange={() => setDepth(option.value)}
                      type="radio"
                      value={option.value}
                    />
                    <span className="depth-option__copy">
                      <strong>{option.label}</strong>
                      <small>{option.description}</small>
                    </span>
                    <span aria-hidden="true" className="depth-option__control" />
                  </label>
                ))}
              </div>
            </fieldset>

            <aside className="explorative-note">
              <strong>Obrolan bisa lebih berani.</strong>
              <p>
                Mode eksploratif dapat mengangkat topik dewasa, sensitif, atau
                kontroversial sesuai kedalaman pilihanmu. Kalian selalu boleh
                melewati pertanyaan.
              </p>
            </aside>

            <div className="session-form__action">
              <button className="button button--amber button--full" type="submit">
                Buat pertanyaan
                <span aria-hidden="true">→</span>
              </button>
              <p>AI akan membuat 10 pertanyaan. Tidak ada riwayat yang disimpan.</p>
            </div>
          </form>
        </main>
      )}

      {view === 'loading' && (
        <main className="loading-screen screen-enter" aria-live="polite">
          <div className="loading-mark" aria-hidden="true">
            <span className="loading-mark__ring" />
            <span className="loading-mark__cards" />
          </div>
          <div className="loading-screen__copy">
            <h1 ref={headingRef} tabIndex={-1}>
              Lagi menyiapkan pertanyaan...
            </h1>
            <p className="loading-screen__tip">{loadingTips[tipIndex]}</p>
            <p className="loading-screen__sub">
              Free tier kadang memerlukan waktu lebih dari satu menit.
            </p>
            <button
              className="text-button text-button--light loading-screen__cancel"
              onClick={cancelLoading}
              type="button"
            >
              Batal & Ubah Pengaturan
            </button>
          </div>
        </main>
      )}

      {view === 'question' && questionPackage && (
        <main className="question-screen screen-enter">
          <header className="question-screen__header">
            <div className="question-screen__nav-meta">
              {currentQuestionIndex > 0 && (
                <button
                  aria-label="Pertanyaan sebelumnya"
                  className="icon-button icon-button--back"
                  disabled={isRegenerating}
                  onClick={previousQuestion}
                  type="button"
                >
                  ←
                </button>
              )}
              <div>
                <strong>{currentQuestionIndex + 1} dari 10</strong>
                <span>
                  {selectedCategory?.label} · {selectedDepth?.label}
                </span>
              </div>
            </div>
            <ProgressRail currentIndex={currentQuestionIndex} />
          </header>

          <section
            aria-busy={isRegenerating}
            className={`question-stage ${isRegenerating ? 'is-regenerating' : ''}`}
            aria-label={`Pertanyaan ${currentQuestionIndex + 1} dari 10`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <span aria-hidden="true" className="question-stage__card question-stage__card--one" />
            <span aria-hidden="true" className="question-stage__card question-stage__card--two" />
            <span aria-hidden="true" className="question-stage__ring" />

            {isRegenerating ? (
              <div className="question-stage__skeleton" aria-live="polite">
                <span className="skeleton-line" />
                <span className="skeleton-line skeleton-line--short" />
                <p>Membuat pertanyaan baru...</p>
              </div>
            ) : (
              <h1
                className="question-stage__prompt"
                key={`${currentQuestionIndex}-${questionPackage.questions[currentQuestionIndex]}`}
                ref={headingRef}
                tabIndex={-1}
              >
                {questionPackage.questions[currentQuestionIndex]}
              </h1>
            )}

            <button
              aria-label="Salin pertanyaan"
              className="copy-button"
              disabled={isRegenerating}
              onClick={() => void copyCurrentQuestion()}
              type="button"
            >
              {isCopied ? '✓ Tersalin' : '📋 Salin'}
            </button>
          </section>

          <footer className="question-screen__footer">
            {regenerationFailed && (
              <div className="question-screen__recovery" role="alert">
                <p>
                  Belum berhasil dibuat ulang. Pertanyaan saat ini tetap aman.
                </p>
                <button
                  className="text-button text-button--light"
                  onClick={() => void regenerateCurrentQuestion()}
                  type="button"
                >
                  Coba lagi
                </button>
              </div>
            )}
            <button
              className="button button--amber button--full"
              onClick={advanceSession}
              disabled={isRegenerating}
              type="button"
            >
              {isLastQuestion ? 'Selesaikan sesi' : 'Pertanyaan berikutnya'}
              <span aria-hidden="true">→</span>
            </button>
            <div className="question-screen__secondary-actions">
              <button
                className="text-button text-button--light"
                onClick={skipQuestion}
                disabled={isRegenerating}
                type="button"
              >
                Lewati
              </button>
              <button
                className="text-button text-button--light"
                disabled={isRegenerating}
                onClick={() => void regenerateCurrentQuestion()}
                type="button"
              >
                {isRegenerating ? 'Membuat ulang…' : 'Buat ulang'}
              </button>
            </div>
            <div className="question-screen__footer-meta">
              <button
                className="text-button text-button--light"
                disabled={isRegenerating}
                onClick={() => setIsConfirmingReset(true)}
                type="button"
              >
                Akhiri sesi
              </button>
              <p>Pertanyaan siap dibacakan.</p>
            </div>
          </footer>

          {isConfirmingReset && (
            <div className="confirm-modal-overlay" role="dialog" aria-modal="true">
              <div className="confirm-modal">
                <h2>Akhiri sesi obrolan?</h2>
                <p>Kemajuan 10 pertanyaan pada sesi ini akan dihapus.</p>
                <div className="confirm-modal__actions">
                  <button
                    className="button button--amber button--full"
                    onClick={resetSession}
                    type="button"
                  >
                    Ya, akhiri sesi
                  </button>
                  <button
                    className="button button--violet button--full"
                    onClick={() => setIsConfirmingReset(false)}
                    type="button"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {view === 'complete' && (
        <main className="complete-screen screen-enter">
          <TableMark compact />
          <div>
            <h1 ref={headingRef} tabIndex={-1}>
              Sesi selesai
            </h1>
            <p>
              10 pertanyaan · {skipCount} dilewati
              {regenerateCount > 0 && ` · ${regenerateCount} dibuat ulang`}
            </p>
            <p className="complete-screen__privacy">Tidak ada riwayat yang disimpan.</p>
          </div>
          <div className="complete-screen__actions">
            <button
              className="button button--amber button--full"
              onClick={() => void startSession()}
              type="button"
            >
              Main lagi dengan topik ini
              <span aria-hidden="true">↻</span>
            </button>
            <button
              className="button button--violet button--full"
              onClick={resetSession}
              type="button"
            >
              Pilih topik baru
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </main>
      )}

      {view === 'error' && (
        <main className="error-screen screen-enter" aria-live="assertive">
          <TableMark compact />
          <div>
            <h1 ref={headingRef} tabIndex={-1}>
              Pertanyaan belum berhasil dibuat.
            </h1>
            <p>
              AI belum berhasil menyiapkan 10 pertanyaan. Pilihanmu tetap aman
              di perangkat ini.
            </p>
          </div>
          <div className="error-screen__actions">
            <button
              className="button button--amber button--full"
              onClick={() => void startSession()}
              type="button"
            >
              Coba lagi
              <span aria-hidden="true">→</span>
            </button>
            <button
              className="text-button"
              onClick={() => setView('setup')}
              type="button"
            >
              Ubah pengaturan
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

