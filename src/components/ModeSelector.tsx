import type { TestLanguage, TestMode } from "@/hooks/useTypingTest";
import { Icon } from "./Icon";
interface Props {
  mode: TestMode;
  modeValue: number;
  language: TestLanguage;
  onModeChange: (mode: TestMode) => void;
  onModeValueChange: (value: number) => void;
  onLanguageChange: (language: TestLanguage) => void;
}
export function ModeSelector({
  mode,
  modeValue,
  language,
  onModeChange,
  onModeValueChange,
  onLanguageChange,
}: Props) {
  return (
    <div className="test-controls">
      <div className="segmented mode-segment" aria-label="Test turi">
        {(["time", "words"] as const).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            aria-pressed={mode === m}
            className={mode === m ? "selected" : ""}
          >
            <Icon name={m === "time" ? "clock" : "book"} size={15} />
            {m === "time" ? "Vaqt" : "So‘zlar"}
          </button>
        ))}
      </div>
      <span className="control-divider" />
      <div
        className="duration-options"
        aria-label={mode === "time" ? "Davomiylik" : "So‘zlar soni"}
      >
        {(mode === "time" ? [15, 30, 60, 120] : [10, 25, 50, 100]).map((v) => (
          <button
            key={v}
            onClick={() => onModeValueChange(v)}
            aria-pressed={modeValue === v}
            className={modeValue === v ? "selected" : ""}
          >
            {v}
            {mode === "time" && <span>s</span>}
          </button>
        ))}
      </div>
      <div className="language-buttons" role="group" aria-label="Test tili">
        <Icon name="globe" size={15} />
        <button
          onClick={() => onLanguageChange("uz")}
          className={language === "uz" ? "selected" : ""}
          aria-pressed={language === "uz"}
        >
          O‘zbekcha
        </button>
        <span>/</span>
        <button
          onClick={() => onLanguageChange("en")}
          className={language === "en" ? "selected" : ""}
          aria-pressed={language === "en"}
        >
          English
        </button>
      </div>
    </div>
  );
}
