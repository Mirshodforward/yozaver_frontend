"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

export type TestMode = "time" | "words";
export type TestLanguage = "en" | "uz";

export interface SpeedSample {
  second: number;
  wpm: number;
  rawWpm: number;
}

export interface FinalResult {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  durationSeconds: number;
  mode: "TIME" | "WORDS";
  modeValue: number;
  language: TestLanguage;
}

interface UseTypingTestOptions {
  mode: TestMode;
  modeValue: number;
  language: TestLanguage;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const LOCAL_WORDS: Record<TestLanguage, string[]> = {
  uz: `bugun ertaga hozir keyin doim yaqin katta kichik yangi yaxshi chiroyli baland keng
    issiq sovuq iliq to'g'ri oson kuchli sog'lom ochiq maktab kitob daftar qalam deraza xona
    hovli bog' gul daraxt meva olma uzum non guruch sut asal choy qahva suv qor yomg'ir
    quyosh oy yulduz osmon yer tog' dengiz daryo ko'l o'rmon shamol oila ona ota aka uka
    opa singil bola inson do'st hayot dunyo vaqt kun tun hafta yil soat daqiqa ish dam
    o'yin sport musiqa rasm gap so'z til xat telefon kompyuter internet dastur dars bilim
    ilm fan tarix adabiyot san'at bozor do'kon shahar qishloq yo'l mashina samolyot poyezd
    mehmon bayram sevgi do'stlik kuch aql yurak qo'l ko'z tabassum orzu maqsad kelajak
    imkoniyat harakat natija tajriba rivoj ijod mehnat muvaffaqiyat yozish tezlik aniqlik`
    .split(/\s+/)
    .filter(Boolean),
  en: `the be to of and a in that have it for on with you at this from they we say or
    will my one all there what about get go when make can like time know take people
    year your good see other now look come think also after use how our work first
    well way new want because give day water long find here thing many under right
    move high world place part sound still hand small land air help line turn same
    follow ask change light kind need house again point near build earth head stand
    page country answer school grow study learn plant food sun city tree farm start
    story sea draw run while press close night life open together next begin walk
    paper group always music both often letter river care enough young ready above
    feel talk bird soon family song measure door short class wind question complete
    dream create focus practice rhythm speed future journey bright idea simple calm`
    .split(/\s+/)
    .filter(Boolean),
};

function normalizeApostrophes(value: string) {
  return value.replace(/[\u2018\u2019\u02bb\u02bc]/g, "'");
}

function localWords(
  language: TestLanguage,
  count: number,
  previousWord?: string,
) {
  const bank = LOCAL_WORDS[language];
  const words: string[] = [];
  let previous = previousWord;
  for (let index = 0; index < count; index++) {
    let selected = Math.floor(Math.random() * bank.length);
    if (bank[selected] === previous) selected = (selected + 1) % bank.length;
    previous = bank[selected];
    words.push(previous);
  }
  return words;
}

export function scoreWords(words: string[], typedWords: string[]) {
  let correctChars = 0;
  let incorrectChars = 0;
  let extraChars = 0;
  let missedChars = 0;

  typedWords.forEach((typed, i) => {
    const target = words[i] ?? "";
    const len = Math.max(typed.length, target.length);
    for (let c = 0; c < len; c++) {
      if (c >= target.length) {
        extraChars++;
      } else if (c >= typed.length) {
        missedChars++;
      } else if (typed[c] === target[c]) {
        correctChars++;
      } else {
        incorrectChars++;
      }
    }
  });

  return { correctChars, incorrectChars, extraChars, missedChars };
}

export function useTypingTest({
  mode,
  modeValue,
  language,
  inputRef,
}: UseTypingTestOptions) {
  const [words, setWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [typedWords, setTypedWords] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [result, setResult] = useState<FinalResult | null>(null);
  const [samples, setSamples] = useState<SpeedSample[]>([]);

  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const typedWordsRef = useRef<string[]>([]);
  const currentInputRef = useRef("");
  const wordsRef = useRef<string[]>([]);
  const statusRef = useRef<"idle" | "running" | "finished">("idle");
  const samplesRef = useRef<SpeedSample[]>([]);
  const requestRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);
  const focusFrameRef = useRef<number | null>(null);

  const wordCount = mode === "time" ? 250 : modeValue;

  const loadWords = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    const generation = ++generationRef.current;

    // A local bank makes every restart immediately playable, including offline.
    const fallback = localWords(language, wordCount);
    wordsRef.current = fallback;
    setWords(fallback);
    setOffline(true);
    setLoading(false);

    const timeout = setTimeout(() => controller.abort(), 3000);
    try {
      const data = await apiFetch<{ words: string[] }>(
        `/words?lang=${language}&count=${wordCount}`,
        { signal: controller.signal },
      );
      if (controller.signal.aborted || generation !== generationRef.current)
        return;
      // A response must never replace the text underneath an active test.
      if (statusRef.current !== "idle") return;
      const received = Array.isArray(data?.words)
        ? data.words
            .filter(
              (word) =>
                typeof word === "string" &&
                word.trim().length > 0 &&
                !/\s/.test(word),
            )
            .map(normalizeApostrophes)
            .slice(0, wordCount)
        : [];
      if (received.length === 0) return;
      const complete = [
        ...received,
        ...localWords(language, wordCount - received.length, received.at(-1)),
      ];
      wordsRef.current = complete;
      setWords(complete);
      setOffline(false);
    } catch {
      // The already visible local words remain available on any network failure.
    } finally {
      clearTimeout(timeout);
    }
  }, [language, wordCount]);

  const finish = useCallback(
    (finalTypedWords: string[]) => {
      if (statusRef.current === "finished") return;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      statusRef.current = "finished";
      setStatus("finished");

      const { correctChars, incorrectChars, extraChars, missedChars } =
        scoreWords(wordsRef.current, finalTypedWords);

      const durationSeconds =
        mode === "time"
          ? modeValue
          : Math.max(
              1,
              Math.round(
                (Date.now() - (startTimeRef.current ?? Date.now())) / 1000,
              ),
            );
      const minutes = durationSeconds / 60;
      const totalTyped = correctChars + incorrectChars + extraChars;
      const wpm = Math.round((correctChars / 5 / minutes) * 10) / 10;
      const rawWpm = Math.round((totalTyped / 5 / minutes) * 10) / 10;
      const finalSamples = [
        ...samplesRef.current.filter(
          (sample) => sample.second < durationSeconds,
        ),
        { second: durationSeconds, wpm, rawWpm },
      ];
      samplesRef.current = finalSamples;
      setSamples(finalSamples);
      setElapsedMs(durationSeconds * 1000);

      setResult({
        wpm,
        rawWpm,
        accuracy:
          totalTyped > 0
            ? Math.round((correctChars / totalTyped) * 1000) / 10
            : 100,
        correctChars,
        incorrectChars,
        extraChars,
        missedChars,
        durationSeconds,
        mode: mode === "time" ? "TIME" : "WORDS",
        modeValue,
        language,
      });
    },
    [mode, modeValue, language],
  );

  const reset = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (focusFrameRef.current !== null)
      cancelAnimationFrame(focusFrameRef.current);
    setCurrentWordIndex(0);
    setCurrentInput("");
    setTypedWords([]);
    setStatus("idle");
    setElapsedMs(0);
    setResult(null);
    setSamples([]);
    samplesRef.current = [];
    statusRef.current = "idle";
    typedWordsRef.current = [];
    currentInputRef.current = "";
    startTimeRef.current = null;
    void loadWords();
    focusFrameRef.current = requestAnimationFrame(() =>
      inputRef.current?.focus(),
    );
  }, [loadWords, inputRef]);

  useEffect(() => {
    reset();
    return () => {
      requestRef.current?.abort();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (focusFrameRef.current !== null)
        cancelAnimationFrame(focusFrameRef.current);
    };
  }, [reset, mode, modeValue]);

  useEffect(() => {
    if (status !== "running") return;

    const tick = () => {
      if (statusRef.current !== "running") return;
      const start = startTimeRef.current ?? Date.now();
      const elapsed = Date.now() - start;
      setElapsedMs(Math.floor(elapsed / 100) * 100);

      if (mode === "time" && elapsed >= modeValue * 1000) {
        finish(
          currentInputRef.current
            ? [...typedWordsRef.current, currentInputRef.current]
            : typedWordsRef.current,
        );
        return;
      }

      const second = Math.floor(elapsed / 1000);
      if (second > 0 && second > (samplesRef.current.at(-1)?.second ?? 0)) {
        const score = scoreWords(wordsRef.current, [
          ...typedWordsRef.current,
          currentInputRef.current,
        ]);
        const minutes = elapsed / 60000;
        const sample: SpeedSample = {
          second,
          wpm: Math.round((score.correctChars / 5 / minutes) * 10) / 10,
          rawWpm:
            Math.round(
              ((score.correctChars + score.incorrectChars + score.extraChars) /
                5 /
                minutes) *
                10,
            ) / 10,
        };
        samplesRef.current = [...samplesRef.current, sample];
        setSamples(samplesRef.current);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [status, mode, modeValue, finish]);

  const handleInputChange = useCallback(
    (rawValue: string) => {
      if (statusRef.current === "finished" || wordsRef.current.length === 0)
        return;
      if (
        mode === "time" &&
        startTimeRef.current !== null &&
        Date.now() - startTimeRef.current >= modeValue * 1000
      ) {
        finish(
          currentInputRef.current
            ? [...typedWordsRef.current, currentInputRef.current]
            : typedWordsRef.current,
        );
        return;
      }
      rawValue = normalizeApostrophes(rawValue);
      const endsWithSpace = rawValue.endsWith(" ");
      const value = rawValue.trim();
      if (/\s/.test(value)) return;

      if (statusRef.current === "idle") {
        if (value.length === 0) return;
        startTimeRef.current = Date.now();
        statusRef.current = "running";
        samplesRef.current = [{ second: 0, wpm: 0, rawWpm: 0 }];
        setSamples(samplesRef.current);
        setStatus("running");
      }

      if (endsWithSpace) {
        if (value.length === 0) return;

        const nextTypedWords = [...typedWordsRef.current, value];
        typedWordsRef.current = nextTypedWords;
        currentInputRef.current = "";
        setTypedWords(nextTypedWords);
        setCurrentInput("");

        const nextIndex = nextTypedWords.length;
        setCurrentWordIndex(nextIndex);

        if (mode === "words" && nextIndex >= wordsRef.current.length) {
          finish(nextTypedWords);
        } else if (
          mode === "time" &&
          nextIndex >= wordsRef.current.length - 30
        ) {
          const extended = [
            ...wordsRef.current,
            ...localWords(language, 250, wordsRef.current.at(-1)),
          ];
          wordsRef.current = extended;
          setWords(extended);
        }
        return;
      }

      const target = wordsRef.current[typedWordsRef.current.length] ?? "";
      const capped = rawValue.slice(0, target.length + 15);
      currentInputRef.current = capped;
      setCurrentInput(capped);
      if (
        mode === "words" &&
        typedWordsRef.current.length === wordsRef.current.length - 1 &&
        capped === target
      ) {
        finish([...typedWordsRef.current, capped]);
      }
    },
    [mode, modeValue, language, finish],
  );

  const restart = useCallback(() => reset(), [reset]);

  return {
    words,
    loading,
    offline,
    currentWordIndex,
    currentInput,
    typedWords,
    status,
    elapsedSeconds: elapsedMs / 1000,
    timeLeft:
      mode === "time" ? Math.max(0, modeValue - elapsedMs / 1000) : null,
    result,
    samples,
    handleInputChange,
    restart,
  };
}
