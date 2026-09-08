"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { OverviewTab } from "@/components/admin/OverviewTab";
import { UsersTab } from "@/components/admin/UsersTab";
import { ResultsTab } from "@/components/admin/ResultsTab";
import { WordsTab } from "@/components/admin/WordsTab";

const TABS = ["overview", "users", "results", "words"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABELS: Record<Tab, string> = {
  overview: "Umumiy",
  users: "Foydalanuvchilar",
  results: "Natijalar",
  words: "So'zlar",
};

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");

  if (loading)
    return <p className="panel text-muted">Boshqaruv paneli yuklanmoqda…</p>;

  if (!user || user.role !== "ADMIN") {
    return (
      <p className="text-center text-muted">
        Sizda bu sahifaga kirish huquqi yo&apos;q.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="page-heading">
        <span className="eyebrow">YOZAVER UZ</span>
        <h1>Boshqaruv paneli</h1>
        <p>Foydalanuvchilar, natijalar va mashq so‘zlarini boshqaring.</p>
      </div>

      <div className="flex gap-2 border-b border-surface-border/60 text-sm">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-3 py-2 transition-colors ${
              tab === t
                ? "border-accent text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "users" && <UsersTab />}
      {tab === "results" && <ResultsTab />}
      {tab === "words" && <WordsTab />}
    </div>
  );
}
