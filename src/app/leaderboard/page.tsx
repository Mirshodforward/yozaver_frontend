"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  LeaderboardTable,
  type LeaderboardRow,
} from "@/components/LeaderboardTable";

const PERIODS = [
  { value: "daily", label: "Bugun" },
  { value: "weekly", label: "Bu hafta" },
  { value: "monthly", label: "Bu oy" },
  { value: "allTime", label: "Barcha vaqt" },
] as const;

export default function LeaderboardPage() {
  const [period, setPeriod] =
    useState<(typeof PERIODS)[number]["value"]>("allTime");
  const [retry, setRetry] = useState(0);
  const [data, setData] = useState<{
    key: string;
    rows: LeaderboardRow[];
    error: boolean;
  }>({ key: "", rows: [], error: false });
  const key = `${period}:${retry}`;
  const loading = data.key !== key;
  const rows = loading ? [] : data.rows;

  useEffect(() => {
    const controller = new AbortController();
    apiFetch<LeaderboardRow[]>(`/leaderboard?period=${period}&limit=50`, {
      signal: controller.signal,
    })
      .then((rows) => setData({ key, rows, error: false }))
      .catch(() => {
        if (!controller.signal.aborted) setData({ key, rows: [], error: true });
      });
    return () => controller.abort();
  }, [period, key]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">YOZAVER JAMOASI</p>
          <h1 className="page-heading">Tezlikda tengsizlar.</h1>
          <p className="mt-2 text-sm text-muted">
            Ilhom oling. Mashq qiling. O‘z o‘rningizni egallang.
          </p>
        </div>
        <Link href="/" className="primary-button">
          Men ham qatnashaman ↗
        </Link>
      </div>
      <div
        className="panel relative overflow-hidden p-6 sm:p-8"
        style={{
          background:
            "linear-gradient(115deg, #eeebfd 0%, #f7f5fe 58%, #fff9f0 100%)",
        }}
      >
        <div className="relative z-10 max-w-md">
          <span className="rounded-full border border-accent/15 bg-white/60 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-accent">
            HAR BIR HARF HISOBDA
          </span>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900">
            Keyingi rekord sizniki bo‘lsin.
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            Reytingda har bir ishtirokchining tanlangan davrdagi eng yaxshi
            natijasi ko‘rsatiladi.
          </p>
        </div>
        <div
          className="pointer-events-none absolute -right-5 bottom-0 hidden h-48 w-64 items-center justify-center sm:flex"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 180 180"
            className="h-44 w-44 -rotate-12 drop-shadow-[14px_18px_16px_#a08bea40]"
          >
            <defs>
              <linearGradient id="trophy-cup" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#d2b9ff" />
                <stop offset=".55" stopColor="#9c7af0" />
                <stop offset="1" stopColor="#6d49c9" />
              </linearGradient>
              <linearGradient id="trophy-edge">
                <stop stopColor="#edddff" />
                <stop offset="1" stopColor="#b194f0" />
              </linearGradient>
            </defs>
            <path
              d="M49 47H26v23c0 19 16 34 37 34M131 47h23v23c0 19-16 34-37 34"
              fill="none"
              stroke="url(#trophy-edge)"
              strokeWidth="12"
            />
            <path
              d="M46 31h88l-9 55c-4 23-20 37-35 37S59 109 55 86Z"
              fill="url(#trophy-cup)"
            />
            <ellipse cx="90" cy="31" rx="44" ry="10" fill="#dbc7ff" />
            <ellipse cx="90" cy="31" rx="34" ry="5" fill="#a582e5" />
            <path d="M83 119h14v25h-14z" fill="url(#trophy-cup)" />
            <path d="M64 141h52l9 17H55z" fill="url(#trophy-cup)" />
            <path
              d="m90 53 7 14 16 2-12 12 3 16-14-8-14 8 3-16-12-12 16-2z"
              fill="#f0e5ff"
            />
          </svg>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="section-heading">Umumiy reyting</h2>
          <p className="mt-1 text-xs text-muted">
            Eng yaxshi 50 ishtirokchi · tezlik va aniqlik
          </p>
        </div>
        <div
          className="flex flex-wrap rounded-xl border border-surface-border bg-white p-1 text-xs"
          aria-label="Reyting davri"
        >
          {PERIODS.map((item) => (
            <button
              key={item.value}
              onClick={() => setPeriod(item.value)}
              aria-pressed={period === item.value}
              className={`rounded-lg px-3 py-2.5 font-medium transition-all sm:px-4 ${period === item.value ? "bg-accent text-white shadow-sm" : "text-muted hover:bg-accent/5"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {!loading && data.error ? (
        <div className="panel p-10 text-center" role="alert">
          <h2 className="text-base font-semibold">
            Reyting bilan aloqa uzildi.
          </h2>
          <p className="mt-2 text-sm text-muted">
            Natijalarni hozir yuklab bo‘lmadi. Birozdan so‘ng qayta urinib
            ko‘ring.
          </p>
          <button
            className="secondary-button mt-5"
            onClick={() => setRetry((value) => value + 1)}
          >
            Qayta urinish ↻
          </button>
        </div>
      ) : (
        <LeaderboardTable rows={rows} loading={loading} />
      )}
      <p className="text-center text-[11px] leading-5 text-muted">
        WPM — bir daqiqada yozilgan so‘zlar soni. Natijangiz reytingga chiqishi
        uchun hisobingizga kiring.
      </p>
    </div>
  );
}
