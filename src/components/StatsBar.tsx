import { Icon } from "./Icon";
export function StatsBar({
  wpm,
  accuracy,
  timeLabel,
}: {
  wpm: number;
  accuracy: number;
  timeLabel: string;
}) {
  return (
    <div className="live-stats">
      <div className="live-timer">
        <Icon name="clock" size={19} />
        <strong>{timeLabel}</strong>
      </div>
      <div>
        <strong>{wpm}</strong>
        <span>WPM</span>
      </div>
      <div>
        <Icon name="target" size={16} />
        <strong>
          {accuracy}
          <small>%</small>
        </strong>
        <span>aniqlik</span>
      </div>
    </div>
  );
}
