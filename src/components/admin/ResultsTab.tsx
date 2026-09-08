"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface AdminResult {
  id: string;
  wpm: number;
  accuracy: number;
  isFlagged: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export function ResultsTab() {
  const { token } = useAuth();
  const [results, setResults] = useState<AdminResult[]>([]);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ items: AdminResult[] }>(
        `/admin/results?flaggedOnly=${flaggedOnly}`,
        {},
        token,
      );
      setResults(data.items);
    } catch {
      setError("Ma’lumotlarni yuklab bo‘lmadi. Qayta urinib ko‘ring.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, flaggedOnly]);

  async function remove(id: string) {
    if (!token) return;
    await apiFetch(`/admin/results/${id}`, { method: "DELETE" }, token);
    load();
  }

  return (
    <div className="panel flex flex-col gap-4">
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-error/10 p-3 text-sm text-error"
        >
          {error}
        </p>
      )}
      <label className="flex w-fit items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={flaggedOnly}
          onChange={(e) => setFlaggedOnly(e.target.checked)}
        />
        Faqat shubhali (wpm &gt; 200)
      </label>

      {loading ? (
        <p className="text-muted">Yuklanmoqda…</p>
      ) : results.length === 0 ? (
        <p className="text-muted">Natijalar topilmadi.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-surface-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface/80 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Ishtirokchi</th>
                <th className="px-4 py-3 text-right">WPM</th>
                <th className="px-4 py-3 text-right">Aniqlik</th>
                <th className="px-4 py-3">Sana</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-t border-surface-border/60">
                  <td className="px-4 py-3">{r.user.name}</td>
                  <td
                    className={`px-4 py-3 text-right font-mono ${r.isFlagged ? "text-error" : "text-accent"}`}
                  >
                    {r.wpm}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-muted">
                    {r.accuracy}%
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setError(null);
                        void remove(r.id).catch(() =>
                          setError("Amal bajarilmadi. Qayta urinib ko‘ring."),
                        );
                      }}
                      className="rounded border border-surface-border px-2 py-1 text-xs hover:border-error/50 hover:text-error"
                    >
                      O‘chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
