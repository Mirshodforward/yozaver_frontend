"use client";
import { memo, useLayoutEffect, useRef } from "react";
interface Props {
  words: string[];
  typedWords: string[];
  currentWordIndex: number;
  currentInput: string;
}
export const TextDisplay = memo(function TextDisplay({
  words,
  typedWords,
  currentWordIndex,
  currentInput,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const track = trackRef.current;
    const frame = frameRef.current;
    if (!track || !frame) return;
    function position() {
      if (!track || !frame) return;
      const caret = track.querySelector<HTMLElement>("[data-caret]");
      if (!caret) return;
      const word = caret.parentElement;
      const x = (word?.offsetLeft ?? 0) + caret.offsetLeft;
      track.style.transform = `translate3d(${frame.clientWidth * 0.5 - x}px,0,0)`;
    }
    position();
    const observer = new ResizeObserver(position);
    observer.observe(frame);
    observer.observe(track);
    return () => observer.disconnect();
  }, [currentWordIndex, currentInput, words]);
  return (
    <div className="typing-text" ref={frameRef} aria-hidden="true">
      <span className="fixed-caret" />
      <div className="typing-words" ref={trackRef}>
        {words.map((word, i) => {
          const active = i === currentWordIndex;
          const done = i < currentWordIndex;
          const typed = done
            ? (typedWords[i] ?? "")
            : active
              ? currentInput
              : "";
          return (
            <span
              key={i}
              className={`typing-word ${active ? "current-word" : ""} ${done && typed !== word ? "wrong-word" : ""}`}
            >
              {Array.from(
                { length: Math.max(word.length, typed.length) },
                (_, j) => (
                  <span
                    key={j}
                    data-caret={
                      active && j === typed.length ? "true" : undefined
                    }
                    className={`${j < typed.length ? (typed[j] === word[j] ? "char-correct" : "char-wrong") : done ? "char-missed" : ""}`}
                  >
                    {word[j] ?? typed[j]}
                  </span>
                ),
              )}
              {active && typed.length >= word.length && (
                <span data-caret="true">&#8203;</span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
});
