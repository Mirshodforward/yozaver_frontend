"use client";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { usePracticeHistory } from "@/lib/practice-history";
import {
  scoreWords,
  useTypingTest,
  type TestLanguage,
  type TestMode,
  type FinalResult,
} from "@/hooks/useTypingTest";
import { ModeSelector } from "@/components/ModeSelector";
import { StatsBar } from "@/components/StatsBar";
import { TextDisplay } from "@/components/TextDisplay";
import { KeyboardPreview } from "@/components/KeyboardPreview";
import { ResultScreen } from "@/components/ResultScreen";
import { Icon } from "@/components/Icon";
import { useAppAudio } from "@/lib/audio-context";
import { useSettings } from "@/lib/settings-context";
import { MUSIC_TRACKS } from "@/lib/preferences";
import Link from "next/link";
export default function Home() {
  const { ready } = useSettings();
  return ready ? (
    <Practice />
  ) : (
    <div
      className="home-page minimal-home"
      aria-label="Sozlamalar yuklanmoqda"
    />
  );
}
function Practice() {
  const { settings, updateSettings } = useSettings();
  const music = useAppAudio();
  const [mode, setMode] = useState<TestMode>(settings.mode);
  const [modeValue, setModeValue] = useState<number>(
    settings.mode === "time" ? settings.timeLimit : settings.wordCount,
  );
  const [language, setLanguage] = useState<TestLanguage>(settings.language);
  const { token, user } = useAuth();
  const { recordResult } = usePracticeHistory();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const test = useTypingTest({ mode, modeValue, language, inputRef });
  const [rank, setRank] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const recordedRef = useRef<FinalResult | null>(null);
  const submitRef = useRef<FinalResult | null>(null);
  const sound = settings.keySoundEnabled;
  const setSound = (value: boolean) =>
    updateSettings({ keySoundEnabled: value });
  const keyboard = settings.showKeyboard;
  const setKeyboard = (value: boolean) =>
    updateSettings({ showKeyboard: value });
  const [focus, setFocus] = useState(settings.focusMode);
  const [inputFocused, setInputFocused] = useState(false);
  useEffect(() => {
    if (!test.result || recordedRef.current === test.result) return;
    recordedRef.current = test.result;
    recordResult(test.result, test.samples);
  }, [test.result, test.samples, recordResult]);
  useEffect(() => {
    if (!test.result || !token || submitRef.current === test.result) return;
    submitRef.current = test.result;
    const current = test.result;
    setSubmitting(true);
    setSaveError(false);
    setRank(null);
    apiFetch<{ rank: number }>(
      "/results",
      { method: "POST", body: JSON.stringify(current) },
      token,
    )
      .then((data) => {
        if (submitRef.current === current) setRank(data.rank);
      })
      .catch(() => {
        if (submitRef.current === current) setSaveError(true);
      })
      .finally(() => {
        if (submitRef.current === current) setSubmitting(false);
      });
  }, [test.result, token]);
  useEffect(() => {
    if (!test.result) {
      submitRef.current = null;
      setRank(null);
      setSaveError(false);
      setSubmitting(false);
    }
  }, [test.result]);
  const restart = test.restart;
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !document.querySelector("dialog[open]")) {
        e.preventDefault();
        if (focus) setFocus(false);
        else restart();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [restart, focus]);
  const playKey = music.playKey;
  const score = scoreWords(test.words, [...test.typedWords, test.currentInput]);
  const total = score.correctChars + score.incorrectChars + score.extraChars;
  const accuracy = total ? Math.round((score.correctChars / total) * 100) : 100;
  const liveWpm =
    test.elapsedSeconds > 0
      ? Math.round(score.correctChars / 5 / (test.elapsedSeconds / 60))
      : 0;
  const nextChar =
    test.words[test.currentWordIndex]?.[test.currentInput.length] ?? " ";
  const progress =
    mode === "time"
      ? test.elapsedSeconds / modeValue
      : test.currentWordIndex / modeValue;
  return (
    <div className={`home-page minimal-home ${focus ? "focus-mode" : ""}`}>
      <h1 className="sr-only">Yozaver uz — bir qatorli yozish testi</h1>
      <section
        ref={panelRef}
        id="typing-test"
        className={`typing-panel minimal-panel ${test.status === "running" ? "test-running" : ""} ${test.status === "idle" ? "test-idle" : ""}`}
      >
        {test.status === "finished" && test.result ? (
          <ResultScreen
            result={test.result}
            samples={test.samples}
            rank={rank}
            isLoggedIn={Boolean(user)}
            submitting={submitting}
            saveError={saveError}
            onRestart={restart}
          />
        ) : (
          <>
            <div
              className={`minimal-live ${settings.showStats ? "" : "stats-hidden"}`}
            >
              <StatsBar
                wpm={liveWpm}
                accuracy={accuracy}
                timeLabel={
                  mode === "time"
                    ? `${Math.ceil(test.timeLeft ?? 0)}s`
                    : `${Math.ceil(test.elapsedSeconds)}s`
                }
              />
            </div>
            <div
              className={`typing-input-area ${inputFocused ? "input-focused" : ""}`}
              onClick={() => inputRef.current?.focus()}
            >
              <span id="current-word-description" className="sr-only">
                Yoziladigan so‘z: {test.words[test.currentWordIndex] ?? ""}.
                Keyingi so‘z uchun bo‘sh joy tugmasini bosing.
              </span>
              <TextDisplay
                words={test.words}
                typedWords={test.typedWords}
                currentWordIndex={test.currentWordIndex}
                currentInput={test.currentInput}
              />
              <input
                ref={inputRef}
                value={test.currentInput}
                onChange={(e) => {
                  test.handleInputChange(e.target.value);
                  playKey();
                }}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onPaste={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                aria-label="Yozish testi uchun matn kiritish"
                aria-describedby="current-word-description"
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                disabled={test.loading}
              />
              {!inputFocused && test.status === "idle" && (
                <span className="minimal-focus-hint">yozish uchun bosing</span>
              )}
            </div>
            <div className="test-progress">
              <span style={{ width: `${Math.min(100, progress * 100)}%` }} />
            </div>
            {keyboard && <KeyboardPreview nextChar={nextChar} />}
            <div className="practice-dock">
              <div className="minimal-toolbar">
                <ModeSelector
                  mode={mode}
                  modeValue={modeValue}
                  language={language}
                  onModeChange={(m) => {
                    setMode(m);
                    setModeValue(
                      m === "time" ? settings.timeLimit : settings.wordCount,
                    );
                  }}
                  onModeValueChange={setModeValue}
                  onLanguageChange={setLanguage}
                />
              </div>
              <div className="minimal-actions">
                <button
                  className="icon-button"
                  onClick={restart}
                  aria-label="Qayta boshlash"
                  title="Qayta boshlash · Esc"
                >
                  <Icon name="reset" size={19} />
                </button>
                <button
                  className={`music-button ${music.playing ? "playing" : ""}`}
                  onClick={() => void music.toggle()}
                  aria-pressed={music.playing}
                  aria-busy={music.loading}
                  aria-label={
                    music.playing || music.loading
                      ? "Fon musiqasini o‘chirish"
                      : "Fon musiqasini yoqish"
                  }
                  title="Sokin fon musiqasi"
                >
                  <Icon name="music" size={17} />
                  <span>{music.loading ? "Yuklanmoqda…" : "Musiqa"}</span>
                  {music.playing && (
                    <span className="music-bars" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
                </button>
                <Link
                  href="/settings"
                  className="icon-button"
                  aria-label="Yozish sozlamalari"
                  title="Sozlamalar"
                >
                  <Icon name="settings" size={18} />
                </Link>
                <span className="minimal-action-divider" />
                <button
                  className={`icon-button ${sound ? "is-on" : ""}`}
                  onClick={() => setSound(!sound)}
                  aria-label={sound ? "Ovozni o‘chirish" : "Ovozni yoqish"}
                  aria-pressed={sound}
                  title={
                    sound ? "Tugma ovozi yoqilgan" : "Tugma ovozi o‘chirilgan"
                  }
                >
                  <Icon name={sound ? "volume" : "mute"} size={18} />
                </button>
                <button
                  className={`icon-button ${keyboard ? "is-on" : ""}`}
                  onClick={() => setKeyboard(!keyboard)}
                  aria-label="Klaviaturani ko‘rsatish"
                  aria-pressed={keyboard}
                  title="Klaviatura"
                >
                  <Icon name="keyboard" size={18} />
                </button>
                <button
                  className={`icon-button ${focus ? "is-on" : ""}`}
                  onClick={() => setFocus(!focus)}
                  aria-label={
                    focus ? "Diqqat rejimidan chiqish" : "Diqqat rejimi"
                  }
                  aria-pressed={focus}
                  title="Diqqat rejimi"
                >
                  <Icon name={focus ? "close" : "expand"} size={17} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
      {music.playing && (
        <div className="music-volume">
          <span className="music-bars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            {MUSIC_TRACKS.find((t) => t.id === music.activeTrack)?.name}
          </span>
          <label>
            <span className="sr-only">Musiqa balandligi</span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(music.volume * 100)}
              onChange={(e) => music.setVolume(Number(e.target.value) / 100)}
            />
          </label>
          <output aria-label="Musiqa ovozi">
            {Math.round(music.volume * 100)}%
          </output>
          <button
            onClick={() => void music.toggle()}
            aria-label="Musiqani to‘xtatish"
          >
            <Icon name="close" size={13} />
          </button>
        </div>
      )}
      {music.error && (
        <p role="status" className="music-error">
          {music.error}
        </p>
      )}
      {settings.showShortcuts && (
        <div className="minimal-bottom">
          <span>
            <kbd>space</kbd> keyingi so‘z
          </span>
          <span>
            <kbd>esc</kbd> qayta boshlash
          </span>
        </div>
      )}
      {music.soundError && (
        <p className="music-error" role="status">
          {music.soundError}
        </p>
      )}
    </div>
  );
}
