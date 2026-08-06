import assert from 'node:assert/strict';
import { afterEach, before, test } from 'node:test';

// Provide an in-memory localStorage for the Node test runner.
function createMemoryStorage(): Storage {
  let store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store = new Map();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

before(() => {
  if (typeof globalThis.localStorage === 'undefined') {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createMemoryStorage(),
      writable: true,
      configurable: true,
    });
  }
});

// Re-import after localStorage is available. Dynamic import so the module
// sees globalThis.localStorage when it is first evaluated.
let createSessionAnalytics: typeof import('../src/analytics.ts').createSessionAnalytics;
let getLifetimeStats: typeof import('../src/analytics.ts').getLifetimeStats;
let getSessionStats: typeof import('../src/analytics.ts').getSessionStats;
let setAnalyticsEnabled: typeof import('../src/analytics.ts').setAnalyticsEnabled;

before(async () => {
  const mod = await import('../src/analytics.ts');
  createSessionAnalytics = mod.createSessionAnalytics;
  getLifetimeStats = mod.getLifetimeStats;
  getSessionStats = mod.getSessionStats;
  setAnalyticsEnabled = mod.setAnalyticsEnabled;
});

afterEach(() => {
  globalThis.localStorage.clear();
  setAnalyticsEnabled(true);
});

// --- Session recording ---

test('session start records category, depth, and increments lifetime count', () => {
  const analytics = createSessionAnalytics('mixed', 'personal');

  const stats = getSessionStats(analytics.sessionId);
  assert.ok(stats, 'Session stats should exist');
  assert.equal(stats.category, 'mixed');
  assert.equal(stats.depth, 'personal');
  assert.equal(stats.skipCount, 0);
  assert.equal(stats.regenerateCount, 0);

  const lifetime = getLifetimeStats();
  assert.equal(lifetime.totalSessions, 1);
});

test('multiple sessions increment the lifetime counter', () => {
  createSessionAnalytics('light', 'casual');
  createSessionAnalytics('funny', 'deep');
  createSessionAnalytics('mixed', 'personal');

  const lifetime = getLifetimeStats();
  assert.equal(lifetime.totalSessions, 3);
});

// --- Skip and regenerate counters ---

test('skip counter increments for the active session', () => {
  const analytics = createSessionAnalytics('reflective', 'deep');

  analytics.recordSkip();
  analytics.recordSkip();

  const stats = getSessionStats(analytics.sessionId);
  assert.ok(stats);
  assert.equal(stats.skipCount, 2);
});

test('regenerate counter increments for the active session', () => {
  const analytics = createSessionAnalytics('funny', 'casual');

  analytics.recordRegenerate();

  const stats = getSessionStats(analytics.sessionId);
  assert.ok(stats);
  assert.equal(stats.regenerateCount, 1);
});

// --- Session completion ---

test('session completion records final stats', () => {
  const analytics = createSessionAnalytics('experience', 'personal');
  analytics.recordSkip();
  analytics.recordSkip();
  analytics.recordRegenerate();

  analytics.recordComplete();

  const stats = getSessionStats(analytics.sessionId);
  assert.ok(stats);
  assert.equal(stats.skipCount, 2);
  assert.equal(stats.regenerateCount, 1);
  assert.ok(stats.completedAt, 'completedAt should be set');
});

// --- Privacy boundary ---

test('no question text is ever stored in localStorage', () => {
  const analytics = createSessionAnalytics('mixed', 'deep');
  analytics.recordSkip();
  analytics.recordRegenerate();
  analytics.recordComplete();

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    const value = localStorage.getItem(key)!;
    assert.ok(
      !value.includes('Pertanyaan'),
      `localStorage key "${key}" must not contain question text`,
    );
  }
});

// --- Failure resilience ---

test('analytics failures do not throw when localStorage write fails', () => {
  const original = localStorage.setItem.bind(localStorage);
  localStorage.setItem = () => {
    throw new DOMException('QuotaExceededError');
  };

  try {
    const analytics = createSessionAnalytics('mixed', 'personal');
    analytics.recordSkip();
    analytics.recordRegenerate();
    analytics.recordComplete();
  } finally {
    localStorage.setItem = original;
  }
});

// --- Disable switch ---

test('disable switch makes all record functions no-ops', () => {
  setAnalyticsEnabled(false);

  const analytics = createSessionAnalytics('mixed', 'personal');
  analytics.recordSkip();
  analytics.recordComplete();

  const lifetime = getLifetimeStats();
  assert.equal(lifetime.totalSessions, 0);
});

test('re-enabling analytics resumes recording', () => {
  setAnalyticsEnabled(false);
  createSessionAnalytics('mixed', 'personal');

  setAnalyticsEnabled(true);
  createSessionAnalytics('funny', 'casual');

  const lifetime = getLifetimeStats();
  assert.equal(lifetime.totalSessions, 1);
});
