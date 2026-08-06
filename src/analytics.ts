import type { Category, Depth } from './question-generator.ts';

export interface SessionStats {
  category: Category;
  depth: Depth;
  skipCount: number;
  regenerateCount: number;
  startedAt: string;
  completedAt: string | null;
}

export interface LifetimeStats {
  totalSessions: number;
}

export interface SessionAnalytics {
  readonly sessionId: string;
  recordSkip(): void;
  recordRegenerate(): void;
  recordComplete(): void;
}

const STORAGE_PREFIX = 'kartu_obrolan_';
const SESSION_COUNT_KEY = `${STORAGE_PREFIX}session_count`;
const ENABLED_KEY = `${STORAGE_PREFIX}analytics_disabled`;

let enabled = true;

function safeWrite(fn: () => void): void {
  try {
    fn();
  } catch {
    // Analytics must never block or break the session flow.
  }
}

function safeRead<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

function sessionKey(sessionId: string): string {
  return `${STORAGE_PREFIX}session_${sessionId}`;
}

function readSession(sessionId: string): SessionStats | null {
  return safeRead(() => {
    const raw = localStorage.getItem(sessionKey(sessionId));
    if (!raw) return null;
    return JSON.parse(raw) as SessionStats;
  }, null);
}

function writeSession(sessionId: string, stats: SessionStats): void {
  safeWrite(() => {
    localStorage.setItem(sessionKey(sessionId), JSON.stringify(stats));
  });
}

export function setAnalyticsEnabled(value: boolean): void {
  enabled = value;
}

const noopAnalytics: SessionAnalytics = {
  sessionId: '',
  recordSkip() {},
  recordRegenerate() {},
  recordComplete() {},
};

export function createSessionAnalytics(
  category: Category,
  depth: Depth,
): SessionAnalytics {
  if (!enabled) return noopAnalytics;

  const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const stats: SessionStats = {
    category,
    depth,
    skipCount: 0,
    regenerateCount: 0,
    startedAt: new Date().toISOString(),
    completedAt: null,
  };

  safeWrite(() => {
    writeSession(sessionId, stats);
    const count = parseInt(localStorage.getItem(SESSION_COUNT_KEY) ?? '0', 10);
    localStorage.setItem(SESSION_COUNT_KEY, String(count + 1));
  });

  return {
    sessionId,

    recordSkip() {
      safeWrite(() => {
        const current = readSession(sessionId);
        if (!current) return;
        current.skipCount += 1;
        writeSession(sessionId, current);
      });
    },

    recordRegenerate() {
      safeWrite(() => {
        const current = readSession(sessionId);
        if (!current) return;
        current.regenerateCount += 1;
        writeSession(sessionId, current);
      });
    },

    recordComplete() {
      safeWrite(() => {
        const current = readSession(sessionId);
        if (!current) return;
        current.completedAt = new Date().toISOString();
        writeSession(sessionId, current);
      });
    },
  };
}

export function getSessionStats(sessionId: string): SessionStats | null {
  return readSession(sessionId);
}

export function getLifetimeStats(): LifetimeStats {
  return safeRead(
    () => ({
      totalSessions: parseInt(
        localStorage.getItem(SESSION_COUNT_KEY) ?? '0',
        10,
      ),
    }),
    { totalSessions: 0 },
  );
}
