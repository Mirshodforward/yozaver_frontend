"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { usePracticeHistory } from "@/lib/practice-history";

interface ResultItem {
  id: string;
  wpm: number;
  accuracy: number;
  mode: "TIME" | "WORDS";
  modeValue: number;
  language: string;
  createdAt: string;
}

interface CloudHistory {
  token: string | null;
  items: ResultItem[];
  best: ResultItem | null;
  error: string | null;
}

function ProgressChart({ results }: { results: ResultItem[] }) {
  const entries = [...results].slice(0, 12).reverse();
  const max = Math.max(60, ...entries.map((item) => item.wpm));
  const points = entries.map((item, index) => ({
    x: entries.length === 1 ? 320 : 40 + (index / (entries.length - 1)) * 540,
    y: 156 - (item.wpm / max) * 120,
    item,
  }));
  const line = points.map(({ x, y }) => `${x},${y}`).join(" ");

  return (
    <div className="panel p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="section-heading">Tezlik dinamikasi</h2>
          <p className="mt-1 text-xs text-muted">
            Oxirgi 12 ta mashq natijalari
          </p>
        </div>
        <span className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
          WPM
        </span>
      </div>
      {entries.length === 0 ? (
        <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-surface-border text-center">
          <p className="text-sm font-medium">Har bir mashq — yangi nuqta.</p>
          <p className="max-w-xs text-xs leading-5 text-muted">
            Birinchi testni yakunlang va o‘sishingizni shu yerda kuzating.
          </p>
        </div>
      ) : (
        <svg
          viewBox="0 0 620 190"
          className="w-full overflow-visible"
          role="img"
          aria-label="Oxirgi mashqlardagi yozish tezligi, WPM"
        >
          <defs>
            <linearGradient id="profile-chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7963ef" stopOpacity=".2" />
              <stop offset="100%" stopColor="#7963ef" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map((ratio) => (
            <g key={ratio}>
              <line
                x1="40"
                x2="590"
                y1={156 - ratio * 120}
                y2={156 - ratio * 120}
                stroke="currentColor"
                className="text-surface-border"
                strokeDasharray="4 5"
              />
              <text x="0" y={160 - ratio * 120} fontSize="10" fill="#97939f">
                {Math.round(max * ratio)}
              </text>
            </g>
          ))}
          {entries.length > 1 && (
            <>
              <polygon
                points={`40,156 ${line} 580,156`}
                fill="url(#profile-chart-fill)"
              />
              <polyline
                points={line}
                fill="none"
                stroke="#7963ef"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}
          {points.map(({ x, y, item }) => (
            <g key={item.id}>
              <circle
                cx={x}
                cy={y}
                r="5"
                fill="#7963ef"
                stroke="white"
                strokeWidth="2"
              >
                <title>
                  {item.wpm} WPM ·{" "}
                  {new Date(item.createdAt).toLocaleDateString("uz-UZ")}
                </title>
              </circle>
            </g>
          ))}
          <text x="40" y="184" fontSize="10" fill="#97939f">
            {new Date(entries[0].createdAt).toLocaleDateString("uz-UZ", {
              day: "numeric",
              month: "short",
            })}
          </text>
          {entries.length > 1 && (
            <text x="580" y="184" textAnchor="end" fontSize="10" fill="#97939f">
              Eng so‘nggi mashq
            </text>
          )}
        </svg>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, token, loading: authLoading, loginUrl } = useAuth();
  const { results } = usePracticeHistory();
  const [source, setSource] = useState<"cloud" | "local">("cloud");
  const [retry, setRetry] = useState(0);
  const [cloud, setCloud] = useState<CloudHistory>({
    token: null,
    items: [],
    best: null,
    error: null,
  });

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    Promise.all([
      apiFetch<ResultItem | null>(
        "/results/me/best",
        { signal: controller.signal },
        token,
      ),
      apiFetch<{ items: ResultItem[] }>(
        "/results/me?pageSize=20",
        { signal: controller.signal },
        token,
      ),
    ])
      .then(([best, history]) =>
        setCloud({ token, items: history.items, best, error: null }),
      )
      .catch(() => {
        if (!controller.signal.aborted)
          setCloud({
            token,
            items: [],
            best: null,
            error:
              "Hisobingizdagi natijalar yuklanmadi. Qayta urinib ko‘ring yoki qurilmadagi tarixni oching.",
          });
      });
    return () => controller.abort();
  }, [token, retry]);

  const isLocal = !user || source === "local";
  const loading = authLoading || (!isLocal && cloud.token !== token);
  const history: ResultItem[] = isLocal ? results : cloud.items;
  const best = isLocal
    ? history.reduce<ResultItem | null>(
        (record, item) => (!record || item.wpm > record.wpm ? item : record),
        null,
      )
    : cloud.best;
  const average = history.length
    ? Math.round(
        history.reduce((sum, item) => sum + item.wpm, 0) / history.length,
      )
    : null;
  const accuracy = history.length
    ? Math.round(
        (history.reduce((sum, item) => sum + item.accuracy, 0) /
          history.length) *
          10,
      ) / 10
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">SHAXSIY KABINET</p>
          <h1 className="page-heading">Kichik qadamlar. Katta o‘sish.</h1>
          <p className="mt-2 text-sm text-muted">
            Har kuni yozing. Natijangizni kuzating. O‘zingizdan o‘zing.
          </p>
        </div>
        <Link href="/" className="primary-button">
          Mashqni boshlash <span aria-hidden="true">↗</span>
        </Link>
      </div>

      <div className="panel flex flex-wrap items-center justify-between gap-5 p-6">
        <div className="flex items-center gap-4">
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-14 w-14 rounded-2xl"
            />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-xl font-bold text-accent">
              {user?.name?.charAt(0) || "Y"}
            </span>
          )}
          <div>
            <h2 className="text-lg font-semibold">
              {user?.name || "Sizning yozish sayohatingiz"}
            </h2>
            <p className="mt-1 text-xs text-muted">
              {user?.email || "Natijalar shu brauzerda saqlanadi."}
            </p>
          </div>
        </div>
        {user ? (
          <div
            className="flex rounded-xl bg-background p-1 text-xs"
            aria-label="Natijalar manbasi"
          >
            {(
              [
                { value: "cloud", label: "Hisobdagi tarix" },
                { value: "local", label: "Shu qurilmada" },
              ] as const
            ).map((item) => (
              <button
                key={item.value}
                onClick={() => setSource(item.value)}
                aria-pressed={source === item.value}
                className={`rounded-lg px-4 py-2.5 font-medium ${source === item.value ? "bg-white text-accent shadow-sm" : "text-muted"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : (
          <a href={loginUrl} className="secondary-button">
            Google orqali kirish <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>

      {!isLocal && cloud.error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-error/20 bg-error/5 p-4 text-sm text-error"
        >
          <p>{cloud.error}</p>
          <button
            onClick={() => {
              setCloud((value) => ({ ...value, token: null, error: null }));
              setRetry((value) => value + 1);
            }}
            className="font-semibold underline underline-offset-4"
          >
            Qayta urinish
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Shaxsiy rekord",
            value: best ? best.wpm : "—",
            unit: "WPM",
            note: "Eng yuqori tezligingiz",
            color: "text-accent",
          },
          {
            label: "O‘rtacha tezlik",
            value: average ?? "—",
            unit: "WPM",
            note: "Ko‘rsatilgan mashqlar bo‘yicha",
            color: "text-foreground",
          },
          {
            label: "O‘rtacha aniqlik",
            value: accuracy ?? "—",
            unit: "%",
            note: "Har bir harf muhim",
            color: "text-emerald-600",
          },
          {
            label: "Mashqlar",
            value: history.length,
            unit: "ta",
            note: isLocal
              ? "Shu qurilmada saqlangan"
              : "So‘nggi 20 ta natijadan",
            color: "text-foreground",
          },
        ].map((stat) => (
          <div key={stat.label} className="panel p-5">
            <p className="text-xs font-medium text-muted">{stat.label}</p>
            <p
              className={`my-3 text-3xl font-semibold tracking-tight ${stat.color}`}
            >
              {loading ? "—" : stat.value}
              <span className="ml-2 text-xs font-medium text-muted">
                {stat.unit}
              </span>
            </p>
            <p className="text-[11px] text-muted">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.8fr_1fr]">
        <ProgressChart results={loading ? [] : history} />
        <div className="panel flex flex-col items-center justify-center p-6 text-center">
          <div
            className="relative mb-4 flex h-28 w-28 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#7963ef ${(accuracy ?? 0) * 3.6}deg, #f0edf8 0deg)`,
            }}
          >
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
              <strong className="text-2xl font-semibold">
                {accuracy ?? "—"}
                <span className="text-sm">%</span>
              </strong>
              <span className="text-[10px] text-muted">ANIQLIK</span>
            </div>
          </div>
          <h2 className="text-sm font-semibold">
            Avval aniqlik, keyin tezlik.
          </h2>
          <p className="mt-2 max-w-60 text-xs leading-5 text-muted">
            Bir maromda yozishga harakat qiling. Tezlik muntazam mashq bilan
            keladi.
          </p>
        </div>
      </div>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-5">
          <h2 className="section-heading">Mashqlar tarixi</h2>
          <span className="text-xs text-muted">
            {isLocal ? "Shu qurilmada" : "So‘nggi natijalar"}
          </span>
        </div>
        {loading ? (
          <p role="status" className="p-8 text-center text-sm text-muted">
            Natijalar yuklanmoqda…
          </p>
        ) : history.length === 0 ? (
          <div className="p-10 text-center">
            <p className="mb-2 text-sm font-medium">
              Birinchi rekordingiz sizni kutmoqda.
            </p>
            <p className="mb-5 text-xs text-muted">
              Qisqa mashqdan boshlang. Har bir urinish hisobda.
            </p>
            <Link href="/" className="secondary-button">
              Yozishni boshlash →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-125 text-left text-sm">
              <thead className="bg-background/50 text-[11px] font-medium text-muted">
                <tr>
                  <th className="px-6 py-4">SANA</th>
                  <th className="px-4 py-4">REJIM</th>
                  <th className="px-4 py-4">TIL</th>
                  <th className="px-4 py-4 text-right">TEZLIK</th>
                  <th className="px-6 py-4 text-right">ANIQLIK</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 20).map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-surface-border/70 transition-colors hover:bg-accent/3"
                  >
                    <td className="px-6 py-4 text-xs text-muted">
                      {new Date(item.createdAt).toLocaleDateString("uz-UZ", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-4 text-xs">
                      {item.modeValue}{" "}
                      {item.mode === "TIME" ? "soniya" : "so‘z"}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted">
                      {item.language.toLowerCase() === "uz"
                        ? "O‘zbekcha"
                        : "English"}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-accent">
                      {item.wpm}
                      <span className="ml-1 text-[10px] font-normal text-muted">
                        wpm
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs">
                      {item.accuracy}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
