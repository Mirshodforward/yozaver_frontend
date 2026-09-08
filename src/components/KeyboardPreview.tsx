const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", "'"],
  ["⇧", "z", "x", "c", "v", "b", "n", "m", "⌫"],
];
export function KeyboardPreview({ nextChar }: { nextChar: string }) {
  const target = nextChar.toLowerCase();
  return (
    <div className="keyboard-preview" aria-hidden="true">
      {ROWS.map((row, i) => (
        <div className="preview-row" key={i}>
          {row.map((key) => (
            <span
              key={key}
              className={`preview-key ${key === target || (key === "'" && ["‘", "’", "ʻ", "ʼ"].includes(target)) ? "next-key" : ""}`}
            >
              {key}
            </span>
          ))}
        </div>
      ))}
      <div className={`preview-space ${target === " " ? "next-key" : ""}`} />
    </div>
  );
}
