import type { FinalResult, SpeedSample } from "@/hooks/useTypingTest";
import { SpeedChart } from "./Analytics";
import { Icon } from "./Icon";
interface Props {
  result: FinalResult;
  samples: SpeedSample[];
  rank: number | null;
  isLoggedIn: boolean;
  submitting: boolean;
  saveError: boolean;
  onRestart: () => void;
}
export function ResultScreen({
  result,
  samples,
  rank,
  isLoggedIn,
  submitting,
  saveError,
  onRestart,
}: Props) {
  return (
    <div className="result-screen">
      <div className="result-heading">
        <span className="result-medal">
          <Icon name="trophy" size={27} />
        </span>
        <div>
          <span className="eyebrow">YANA BIR QADAM OLDINGA</span>
          <h2>Zo‘r, test yakunlandi!</h2>
        </div>
        <button className="primary-button" onClick={onRestart}>
          <Icon name="reset" size={16} />
          Yana bir bor
        </button>
      </div>
      <div className="result-stats">
        {[
          { label: "Yozish tezligi", value: result.wpm, unit: "WPM" },
          { label: "Aniqlik", value: result.accuracy, unit: "%" },
          { label: "Xom tezlik", value: result.rawWpm, unit: "WPM" },
          { label: "Vaqt", value: result.durationSeconds, unit: "soniya" },
        ].map((s) => (
          <div key={s.label}>
            <span>{s.label}</span>
            <strong>
              {s.value}
              <small>{s.unit}</small>
            </strong>
          </div>
        ))}
      </div>
      <SpeedChart samples={samples} />
      <div className="result-footer">
        <span>
          <span className="legend-dot" />
          Tezlik <span className="legend-dot pale" />
          Xom tezlik
        </span>
        <span role="status">
          {isLoggedIn
            ? submitting
              ? "Reytingga saqlanmoqda…"
              : saveError
                ? "Reytingga yuborilmadi. Natija shu brauzer tarixida."
                : rank
                  ? `Reytingdagi o‘rningiz: #${rank}`
                  : "Test yakunlandi."
            : "Natijangiz shu brauzer tarixida. Reyting uchun hisobga kiring."}
        </span>
      </div>
      <div className="character-summary">
        <span>
          <b>{result.correctChars}</b> to‘g‘ri
        </span>
        <span>
          <b>{result.incorrectChars}</b> xato
        </span>
        <span>
          <b>{result.extraChars}</b> ortiqcha
        </span>
        <span>
          <b>{result.missedChars}</b> o‘tkazib yuborilgan belgi
        </span>
      </div>
    </div>
  );
}
