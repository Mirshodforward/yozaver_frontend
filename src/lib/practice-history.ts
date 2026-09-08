"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { FinalResult, SpeedSample } from "@/hooks/useTypingTest";

export type { SpeedSample } from "@/hooks/useTypingTest";

export interface PracticeResult extends FinalResult {
  id: string;
  createdAt: string;
  samples: SpeedSample[];
}

const STORAGE_KEY = "yozaver_history";
const HISTORY_EVENT = "yozaver:history";
const MAX_RESULTS = 200;
const EMPTY_RESULTS: PracticeResult[] = [];
let cachedRaw: string | null | undefined;
let cachedResults: PracticeResult[] = EMPTY_RESULTS;
let storageUnavailable = false;

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function validResult(value: unknown): value is PracticeResult {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.createdAt === "string" &&
    Number.isFinite(Date.parse(entry.createdAt)) &&
    (entry.mode === "TIME" || entry.mode === "WORDS") &&
    (entry.language === "uz" || entry.language === "en") &&
    [
      "wpm",
      "rawWpm",
      "accuracy",
      "correctChars",
      "incorrectChars",
      "extraChars",
      "missedChars",
      "durationSeconds",
      "modeValue",
    ].every((key) => isNonNegativeNumber(entry[key])) &&
    Number(entry.accuracy) <= 100 &&
    Number(entry.durationSeconds) > 0 &&
    Number(entry.modeValue) > 0 &&
    Array.isArray(entry.samples) &&
    entry.samples.every((sample: unknown) => {
      if (!sample || typeof sample !== "object") return false;
      const point = sample as Record<string, unknown>;
      return (
        isNonNegativeNumber(point.second) &&
        isNonNegativeNumber(point.wpm) &&
        isNonNegativeNumber(point.rawWpm)
      );
    })
  );
}

function readHistory(): PracticeResult[] {
  if (typeof window === "undefined") return EMPTY_RESULTS;
  if (storageUnavailable) return cachedResults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedResults;
    cachedRaw = raw;
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedResults = Array.isArray(parsed)
      ? parsed.filter(validResult).slice(0, MAX_RESULTS)
      : EMPTY_RESULTS;
  } catch {
    // Blocked storage and invalid JSON must not prevent a visitor from practicing.
    cachedResults = EMPTY_RESULTS;
  }
  return cachedResults;
}

function writeHistory(results: PracticeResult[]) {
  cachedResults = results;
  cachedRaw = JSON.stringify(results);
  try {
    window.localStorage.setItem(STORAGE_KEY, cachedRaw);
    storageUnavailable = false;
  } catch {
    // Keep an in-memory history when private browsing or storage quotas prevent writes.
    storageUnavailable = true;
  }
  window.dispatchEvent(new Event(HISTORY_EVENT));
}

function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      storageUnavailable = false;
      cachedRaw = undefined;
      callback();
    }
  };
  window.addEventListener(HISTORY_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(HISTORY_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function usePracticeHistory() {
  const results = useSyncExternalStore(
    subscribe,
    readHistory,
    () => EMPTY_RESULTS,
  );

  const recordResult = useCallback(
    (result: FinalResult, samples: SpeedSample[]) => {
      const entry: PracticeResult = {
        ...result,
        id:
          globalThis.crypto?.randomUUID?.() ??
          `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        createdAt: new Date().toISOString(),
        samples: samples.map((sample) => ({ ...sample })),
      };
      writeHistory([entry, ...readHistory()].slice(0, MAX_RESULTS));
    },
    [],
  );

  const clearHistory = useCallback(() => writeHistory([]), []);

  return { results, recordResult, clearHistory };
}
