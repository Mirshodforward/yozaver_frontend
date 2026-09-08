"use client";
import { useSyncExternalStore } from "react";

export const THEMES = [
  {
    id: "cobalt",
    name: "Moviy",
    description: "Keng osmon, tiniq fikr",
    background: "linear-gradient(135deg,#497ce5,#1239ac)",
    foreground: "#fff",
    accent: "#fff",
    dark: true,
  },
  {
    id: "paper",
    name: "Qog‘oz",
    description: "Yengil va ortiqcha bezaksiz",
    background: "linear-gradient(135deg,#fff,#eff2f8)",
    foreground: "#303c52",
    accent: "#4263eb",
    dark: false,
  },
  {
    id: "midnight",
    name: "Tun",
    description: "Tungi mashqlar uchun",
    background: "linear-gradient(135deg,#293345,#0d1320)",
    foreground: "#e7edf8",
    accent: "#90b7ff",
    dark: true,
  },
  {
    id: "forest",
    name: "O‘rmon",
    description: "Tabiatning sokin ranglari",
    background: "linear-gradient(135deg,#346c5c,#123b32)",
    foreground: "#edf9f2",
    accent: "#a8e6c3",
    dark: true,
  },
  {
    id: "sunset",
    name: "Shafaq",
    description: "Iliq, yumshoq kayfiyat",
    background: "linear-gradient(135deg,#f8dfce,#e7bdc9)",
    foreground: "#684654",
    accent: "#984b6e",
    dark: false,
  },
  {
    id: "lavender",
    name: "Lavanda",
    description: "Ilhom uchun mayin ranglar",
    background: "linear-gradient(135deg,#f0eaff,#d7d1f5)",
    foreground: "#50436f",
    accent: "#7861ca",
    dark: false,
  },
] as const;
export const MUSIC_TRACKS = [
  {
    id: "sokin-ohang",
    name: "Sokin ohang",
    description: "Yumshoq klavishlar · 80 BPM",
    icon: "music",
  },
  {
    id: "tong",
    name: "Tong nafasi",
    description: "Yorqin kuy · 90 BPM",
    icon: "sparkles",
  },
  {
    id: "tun",
    name: "Tungi osmon",
    description: "Chuqur, sekin ohang · 60 BPM",
    icon: "moon",
  },
  {
    id: "yomgir",
    name: "Yomg‘ir",
    description: "Yomg‘ir shovqini va sokin kuy",
    icon: "rain",
  },
  {
    id: "dengiz",
    name: "Dengiz",
    description: "Mayin to‘lqinlar va iliq akkordlar",
    icon: "wave",
  },
  {
    id: "lofi",
    name: "Lo-fi ritm",
    description: "Yengil ritm · 80 BPM",
    icon: "headphones",
  },
] as const;
export const KEY_SOUNDS = [
  { id: "soft", name: "Mayin", description: "Yumshoq va yengil chertish" },
  { id: "mechanical", name: "Mexanik", description: "Aniq klaviatura tovushi" },
  {
    id: "typewriter",
    name: "Yozuv mashinkasi",
    description: "Klassik, jarangdor tugma",
  },
  { id: "wood", name: "Yog‘och", description: "Iliq va tabiiy taqillash" },
  { id: "bubble", name: "Pufakcha", description: "Yengil, o‘ynoqi tovush" },
  { id: "digital", name: "Raqamli", description: "Qisqa elektron signal" },
] as const;
export type ThemeId = (typeof THEMES)[number]["id"];
export const PREMIUM_BACKGROUNDS = [
  {
    id: "aurora",
    name: "Aurora",
    description: "Shimol yog‘dusining sokin oqimi",
    theme: "midnight",
  },
  {
    id: "orbit",
    name: "Orbital",
    description: "Fazoda aylanuvchi 3D sayyoralar",
    theme: "midnight",
  },
  {
    id: "waves",
    name: "Okean",
    description: "Moviy yorug‘lik to‘lqinlari",
    theme: "cobalt",
  },
  {
    id: "prism",
    name: "Prizma",
    description: "Suzuvchi 3D shisha shakllar",
    theme: "lavender",
  },
  {
    id: "stars",
    name: "Kosmos",
    description: "Chuqurlikka cho‘zilgan yulduzlar",
    theme: "midnight",
  },
  {
    id: "mercury",
    name: "Merkuriy",
    description: "Shaklini o‘zgartiruvchi suyuq metall",
    theme: "paper",
    badge: "YANGI · 3D",
  },
  {
    id: "tunnel",
    name: "Neon tunnel",
    description: "Yorug‘lik yo‘lagi bo‘ylab sayohat",
    theme: "midnight",
    badge: "YANGI · 3D",
  },
  {
    id: "kinetic",
    name: "Kinetika",
    description: "Raqsga tushuvchi mis halqalar",
    theme: "sunset",
    badge: "YANGI · 3D",
  },
  {
    id: "matrix",
    name: "Raqamli yomg‘ir",
    description: "Tushayotgan harflar va yashil nur",
    theme: "forest",
    badge: "YANGI · LIVE",
  },
  {
    id: "fireflies",
    name: "Yorug‘lik bog‘i",
    description: "Tun ichida uchuvchi oltin zarralar",
    theme: "midnight",
    badge: "YANGI · LIVE",
  },
] as const;
export type BackgroundEffect =
  "none" | (typeof PREMIUM_BACKGROUNDS)[number]["id"];
export type MusicId = (typeof MUSIC_TRACKS)[number]["id"];
export type KeySoundId = (typeof KEY_SOUNDS)[number]["id"];
export interface Preferences {
  theme: ThemeId;
  backgroundEffect: BackgroundEffect;
  musicTrack: MusicId;
  musicVolume: number;
  keySound: KeySoundId;
  keySoundEnabled: boolean;
  keyVolume: number;
  fontSize: 32 | 40 | 48;
  fontFamily: "sans" | "mono";
  caret: "line" | "block" | "underline";
  smoothText: boolean;
  reduceMotion: boolean;
  showKeyboard: boolean;
  showStats: boolean;
  showShortcuts: boolean;
  focusMode: boolean;
  language: "uz" | "en";
  mode: "time" | "words";
  timeLimit: 15 | 30 | 60 | 120;
  wordCount: 10 | 25 | 50 | 100;
  customBackground: boolean;
  backgroundDim: number;
  backgroundBlur: number;
}
export const DEFAULT_PREFERENCES: Preferences = {
  theme: "cobalt",
  backgroundEffect: "none",
  musicTrack: "sokin-ohang",
  musicVolume: 0.45,
  keySound: "soft",
  keySoundEnabled: true,
  keyVolume: 0.6,
  fontSize: 40,
  fontFamily: "sans",
  caret: "line",
  smoothText: true,
  reduceMotion: false,
  showKeyboard: false,
  showStats: true,
  showShortcuts: true,
  focusMode: false,
  language: "uz",
  mode: "time",
  timeLimit: 30,
  wordCount: 25,
  customBackground: false,
  backgroundDim: 0.5,
  backgroundBlur: 0,
};
const KEY = "yozaver_settings";
const EVENT = "yozaver:settings";
const enums: Record<string, readonly unknown[]> = {
  theme: THEMES.map((t) => t.id),
  backgroundEffect: ["none", ...PREMIUM_BACKGROUNDS.map((b) => b.id)],
  musicTrack: MUSIC_TRACKS.map((t) => t.id),
  keySound: KEY_SOUNDS.map((t) => t.id),
  fontSize: [32, 40, 48],
  fontFamily: ["sans", "mono"],
  caret: ["line", "block", "underline"],
  language: ["uz", "en"],
  mode: ["time", "words"],
  timeLimit: [15, 30, 60, 120],
  wordCount: [10, 25, 50, 100],
};
export function validatePreferences(value: unknown): Preferences {
  const input =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const next = { ...DEFAULT_PREFERENCES };
  for (const key of Object.keys(next) as (keyof Preferences)[]) {
    const item = input[key];
    if (enums[key]?.includes(item)) Object.assign(next, { [key]: item });
    else if (typeof next[key] === "boolean" && typeof item === "boolean")
      Object.assign(next, { [key]: item });
  }
  for (const key of [
    "musicVolume",
    "keyVolume",
    "backgroundDim",
    "backgroundBlur",
  ] as const) {
    const v = input[key];
    if (typeof v === "number" && Number.isFinite(v))
      next[key] = Math.max(
        key === "backgroundDim" ? 0.2 : 0,
        Math.min(
          key === "backgroundBlur" ? 12 : key === "backgroundDim" ? 0.85 : 1,
          v,
        ),
      );
  }
  return next;
}
const serverSnapshot = {
  settings: DEFAULT_PREFERENCES,
  ready: false,
  storageAvailable: true,
};
let snapshot = {
  settings: DEFAULT_PREFERENCES,
  ready: true,
  storageAvailable: true,
};
let rawCache: string | null | undefined;
let memoryOnly = false;
function read() {
  if (typeof window === "undefined") return serverSnapshot;
  if (memoryOnly) return snapshot;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== rawCache) {
      rawCache = raw;
      let parsed: unknown = {};
      try {
        parsed = raw ? JSON.parse(raw) : {};
      } catch {}
      snapshot = {
        settings: validatePreferences(parsed),
        ready: true,
        storageAvailable: true,
      };
    }
  } catch {
    memoryOnly = true;
    snapshot = { ...snapshot, storageAvailable: false };
  }
  return snapshot;
}
function subscribe(listener: () => void) {
  const storage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) {
      memoryOnly = false;
      rawCache = undefined;
      listener();
    }
  };
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", storage);
  };
}
export function updatePreferences(patch: Partial<Preferences>) {
  const settings = validatePreferences({ ...read().settings, ...patch });
  rawCache = JSON.stringify(settings);
  let storageAvailable = true;
  try {
    localStorage.setItem(KEY, rawCache);
    memoryOnly = false;
  } catch {
    memoryOnly = true;
    storageAvailable = false;
  }
  snapshot = { settings, ready: true, storageAvailable };
  window.dispatchEvent(new Event(EVENT));
}
export function resetPreferences() {
  updatePreferences(DEFAULT_PREFERENCES);
}
export function usePreferences() {
  return {
    ...useSyncExternalStore(subscribe, read, () => serverSnapshot),
    updateSettings: updatePreferences,
    resetSettings: resetPreferences,
  };
}
