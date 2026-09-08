"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Stats {
  totalUsers: number;
  newUsersThisWeek: number;
  totalTests: number;
  testsToday: number;
  averageWpm: number;
}

export function OverviewTab() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch<Stats>("/admin/stats", {}, token)
      .then(setStats)
      .catch(() => setError(true));
  }, [token]);

  if (error)
    return (
      <p role="alert" className="panel text-error">
        Statistika yuklanmadi. Sahifani yangilab qayta urinib ko‘ring.
      </p>
    );
  if (!stats) return <p className="text-muted">Yuklanmoqda…</p>;

  const cards = [
    { label: "Jami foydalanuvchilar", value: stats.totalUsers },
    { label: "Shu hafta yangi", value: stats.newUsersThisWeek },
    { label: "Jami testlar", value: stats.totalTests },
    { label: "Bugungi testlar", value: stats.testsToday },
    { label: "O'rtacha WPM", value: stats.averageWpm },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-surface-border bg-surface/60 p-5"
        >
          <div className="font-mono text-2xl text-accent">{c.value}</div>
          <div className="text-xs uppercase tracking-wide text-muted">
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}
