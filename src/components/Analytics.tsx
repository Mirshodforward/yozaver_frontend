"use client";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { usePracticeHistory } from "@/lib/practice-history";
import type { SpeedSample } from "@/hooks/useTypingTest";
import { Icon } from "./Icon";

type Point = { label: string; value: number; secondary?: number };
export function LineChart({
  points,
  label = "Yozish tezligi",
}: {
  points: Point[];
  label?: string;
}) {
  const id = useId().replaceAll(":", "");
  const [selected, setSelected] = useState<number | null>(null);
  const max = Math.max(
    40,
    Math.ceil(
      Math.max(...points.map((p) => Math.max(p.value, p.secondary ?? 0)), 0) /
        20,
    ) * 20,
  );
  const coords = points.map((p, i) => ({
    ...p,
    x: points.length === 1 ? 330 : 45 + (i / (points.length - 1)) * 600,
    y: 175 - (p.value / max) * 145,
  }));
  const path = coords.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
  const secondary = coords
    .map(
      (p, i) =>
        `${i ? "L" : "M"}${p.x},${175 - ((p.secondary ?? p.value) / max) * 145}`,
    )
    .join(" ");
  const active = selected !== null ? coords[selected] : undefined;
  return (
    <div className="chart-wrap">
      <svg
        viewBox="0 0 680 210"
        role="img"
        aria-label={label}
        className="line-chart"
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7963ef" stopOpacity=".2" />
            <stop offset="100%" stopColor="#7963ef" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line
              x1="45"
              x2="645"
              y1={30 + i * 36.25}
              y2={30 + i * 36.25}
              stroke="#ececf3"
              strokeDasharray="4 5"
            />
            <text
              x="29"
              y={34 + i * 36.25}
              textAnchor="end"
              fill="#9a9bab"
              fontSize="10"
            >
              {Math.round(max * (1 - i / 4))}
            </text>
          </g>
        ))}
        {coords.length > 0 && (
          <>
            <path
              d={`${path} L${coords.at(-1)!.x},175 L${coords[0].x},175 Z`}
              fill={`url(#${id})`}
            />
            {points.some((p) => p.secondary !== undefined) && (
              <path
                d={secondary}
                fill="none"
                stroke="#bfb4f5"
                strokeWidth="2"
                strokeDasharray="5 5"
              />
            )}
            <path
              d={path}
              fill="none"
              stroke="#7963ef"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="chart-line"
            />
            {coords.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={selected === i ? 6 : 3.5}
                  fill="#7963ef"
                  stroke="white"
                  strokeWidth="2"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="12"
                  fill="transparent"
                  tabIndex={0}
                  role="button"
                  aria-label={`${p.label}: ${p.value} WPM`}
                  onFocus={() => setSelected(i)}
                  onBlur={() => setSelected(null)}
                  onMouseEnter={() => setSelected(i)}
                  onMouseLeave={() => setSelected(null)}
                  onClick={() => setSelected(selected === i ? null : i)}
                >
                  <title>
                    {p.label}: {p.value} WPM
                  </title>
                </circle>
                {(i === 0 ||
                  i === coords.length - 1 ||
                  (coords.length > 4 &&
                    i === Math.floor(coords.length / 2))) && (
                  <text
                    x={p.x}
                    y="199"
                    textAnchor="middle"
                    fill="#9a9bab"
                    fontSize="10"
                  >
                    {p.label}
                  </text>
                )}
              </g>
            ))}
          </>
        )}
        {active && (
          <g pointerEvents="none">
            <line
              x1={active.x}
              x2={active.x}
              y1="25"
              y2="175"
              stroke="#7963ef"
              strokeDasharray="3 4"
              opacity=".35"
            />
            <rect
              x={Math.min(570, Math.max(40, active.x - 50))}
              y={Math.max(0, active.y - 39)}
              width="104"
              height="28"
              rx="7"
              fill="#28233e"
            />
            <text
              x={Math.min(570, Math.max(40, active.x - 50)) + 52}
              y={Math.max(0, active.y - 39) + 18}
              textAnchor="middle"
              fill="white"
              fontSize="11"
            >
              {active.value} WPM
            </text>
          </g>
        )}
      </svg>
      {!points.length && (
        <div className="chart-empty">
          <span className="empty-chart-icon">
            <Icon name="chart" size={23} />
          </span>
          <strong>Sizning o‘sish hikoyangiz shu yerdan boshlanadi</strong>
          <span>Birinchi testdan so‘ng tezlik grafigingiz paydo bo‘ladi.</span>
          <Link href="/#typing-test">
            Birinchi qadamni qo‘ying <Icon name="arrow" size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
export function SpeedChart({ samples }: { samples: SpeedSample[] }) {
  return (
    <LineChart
      points={samples.map((p) => ({
        label: `${p.second}s`,
        value: p.wpm,
        secondary: p.rawWpm,
      }))}
      label="Test davomida soniyalar bo‘yicha WPM va xom tezlik"
    />
  );
}
export function Analytics({ compact = false }: { compact?: boolean }) {
  const { results } = usePracticeHistory();
  const [period, setPeriod] = useState("7");
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  const cutoff = period === "all" ? 0 : now - Number(period) * 86400000;
  const filtered = results.filter((r) => Date.parse(r.createdAt) >= cutoff);
  const chartResults = [...filtered].reverse().slice(-40);
  const accuracy = filtered.length
    ? filtered.reduce((s, r) => s + r.accuracy, 0) / filtered.length
    : 0;
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - 6 + i);
    return {
      date: d,
      count: results.filter(
        (r) => new Date(r.createdAt).toDateString() === d.toDateString(),
      ).length,
    };
  });
  const activeDays = days.filter((d) => d.count > 0).length;
  return (
    <section className="analytics-section" aria-label="Shaxsiy analitika">
      <div className="section-top">
        <div>
          <span className="eyebrow">HARAKATINGIZ NATIJASI</span>
          <h2 className="section-heading">
            O‘sishingizni kuzating<span className="heading-dot">.</span>
          </h2>
        </div>
        {compact && (
          <Link href="/analytics" className="text-link">
            Barcha statistika
            <Icon name="arrowUp" size={17} />
          </Link>
        )}
      </div>
      <div className="analytics-grid">
        <div className="panel progress-panel">
          <div className="panel-title-row">
            <div>
              <h3>Yozish tezligi</h3>
              <span className="muted text-xs">
                {filtered.length
                  ? `${filtered.length} ta test · so‘nggi 40 ta natija`
                  : "Har bir mashq — yangi imkoniyat"}
              </span>
            </div>
            <div className="segmented period-selector">
              {[
                ["7", "7 kun"],
                ["30", "30 kun"],
                ["all", "Barchasi"],
              ].map(([v, l]) => (
                <button
                  key={v}
                  className={period === v ? "selected" : ""}
                  aria-pressed={period === v}
                  onClick={() => setPeriod(v)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-legend">
            <span />
            Tezlik (WPM)
          </div>
          <LineChart
            points={chartResults.map((r) => ({
              label: new Date(r.createdAt).toLocaleDateString("uz-UZ", {
                day: "numeric",
                month: "short",
              }),
              value: r.wpm,
            }))}
          />
        </div>
        <div className="panel activity-panel">
          <div className="panel-title-row">
            <h3>Mashq ritmingiz</h3>
            <Icon name="fire" size={19} />
          </div>
          <div className="activity-ring">
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle
                cx="60"
                cy="60"
                r="49"
                fill="none"
                stroke="#f0edf9"
                strokeWidth="9"
              />
              <circle
                cx="60"
                cy="60"
                r="49"
                fill="none"
                stroke="#8b75ef"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`${(activeDays / 7) * 308} 308`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div>
              <strong>
                {activeDays}
                <span>/7</span>
              </strong>
              <span>faol kun</span>
            </div>
          </div>
          <div className="activity-days">
            {days.map((d, i) => (
              <div
                key={i}
                className={d.count ? "day-active" : ""}
                title={`${d.date.toLocaleDateString("uz-UZ")}: ${d.count} ta test`}
              >
                <span>
                  {["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"][d.date.getDay()]}
                </span>
                <i>{d.count ? <Icon name="check" size={12} /> : <span />}</i>
              </div>
            ))}
          </div>
          <p className="activity-note">
            {activeDays
              ? "Ajoyib! Shu ritmda davom eting."
              : "Kichik odatlar katta natijalarga olib keladi."}
          </p>
          <div className="activity-accuracy">
            <span>O‘rtacha aniqlik</span>
            <strong>{filtered.length ? `${accuracy.toFixed(1)}%` : "—"}</strong>
          </div>
        </div>
      </div>
      {!compact && (
        <div className="panel history-panel">
          <div className="panel-title-row">
            <h3>So‘nggi natijalar</h3>
            <span className="muted text-xs">
              Shu brauzerda saqlangan mashqlar
            </span>
          </div>
          {filtered.length ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sana</th>
                    <th>Tezlik</th>
                    <th>Aniqlik</th>
                    <th>Test</th>
                    <th>Til</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 20).map((r) => (
                    <tr key={r.id}>
                      <td>
                        {new Date(r.createdAt).toLocaleString("uz-UZ", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td>
                        <strong>{r.wpm}</strong> WPM
                      </td>
                      <td>{r.accuracy}%</td>
                      <td>
                        {r.modeValue} {r.mode === "TIME" ? "soniya" : "so‘z"}
                      </td>
                      <td>{r.language === "uz" ? "O‘zbekcha" : "English"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-history">
              Bu davrda yakunlangan testlar yo‘q. Mashqni boshlang — natijalar
              shu yerda ko‘rinadi.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
