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
  explorative: boolean,
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
      body: JSON.stringify({ category, depth, explorative }),
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
  explorative: boolean,
  existingQuestions: string[],
): Promise<string> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 95_000);

  let response: Response;
  try {
    response = await fetch('/api/question-replacement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, depth, explorative, existingQuestions }),
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
  const [explorative, setExplorative] = useState(true);
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
        explorative,
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
        explorative,
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

            <aside className="explorative-card">
              <label className="explorative-toggle">
                <div className="explorative-toggle__copy">
                  <strong>Mode Eksploratif</strong>
                  <p>
                    Mengangkat topik dewasa, sensitif, atau kontroversial sesuai
                    kedalaman pilihanmu. Kalian selalu boleh melewati
                    pertanyaan.
                  </p>
                </div>
                <div className="switch-control">
                  <input
                    checked={explorative}
                    onChange={e => setExplorative(e.target.checked)}
                    type="checkbox"
                  />
                  <span aria-hidden="true" className="switch-control__slider" />
                </div>
              </label>
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
            <div className="question-screen__header-top">
              {currentQuestionIndex > 0 ? (
                <button
                  aria-label="Pertanyaan sebelumnya"
                  className="icon-button icon-button--back"
                  disabled={isRegenerating}
                  onClick={previousQuestion}
                  type="button"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
              ) : (
                <div className="icon-button-placeholder" aria-hidden="true" />
              )}

              <div className="question-screen__meta-pills">
                <span className="meta-counter">
                  {currentQuestionIndex + 1} dari 10
                </span>
                <span className="meta-dot">•</span>
                <span className="meta-tags">
                  {selectedCategory?.label} · {selectedDepth?.label}
                </span>
              </div>

              <button
                aria-label="Salin pertanyaan"
                className={`copy-chip ${isCopied ? 'is-copied' : ''}`}
                disabled={isRegenerating}
                onClick={() => void copyCurrentQuestion()}
                type="button"
              >
                {isCopied ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Salin</span>
                  </>
                )}
              </button>
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
                className="action-chip-btn"
                onClick={skipQuestion}
                disabled={isRegenerating}
                type="button"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <line x1="19" y1="5" x2="19" y2="19" />
                </svg>
                <span>Lewati</span>
              </button>
              <button
                className="action-chip-btn"
                disabled={isRegenerating}
                onClick={() => void regenerateCurrentQuestion()}
                type="button"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isRegenerating ? 'spin-icon' : ''}
                >
                  <path d="M21.5 2v6h-6M2.5 22v-6h6" />
                  <path d="M2 11.5a10 10 0 0 1 18.8-4.3L21.5 8M22 12.5a10 10 0 0 1-18.8 4.2L2.5 16" />
                </svg>
                <span>{isRegenerating ? 'Membuat ulang…' : 'Buat ulang'}</span>
              </button>
            </div>
            <div className="question-screen__footer-meta">
              <button
                className="end-session-button"
                disabled={isRegenerating}
                onClick={() => setIsConfirmingReset(true)}
                type="button"
              >
                Akhiri sesi
              </button>
              <span className="footer-status">Pertanyaan siap dibacakan.</span>
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

