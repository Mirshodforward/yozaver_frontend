"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface AdminWord {
  id: string;
  text: string;
  language: "EN" | "UZ";
  isActive: boolean;
}

export function WordsTab() {
  const { token } = useAuth();
  const [words, setWords] = useState<AdminWord[]>([]);
  const [lang, setLang] = useState<"en" | "uz">("en");
  const [newWord, setNewWord] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ items: AdminWord[] }>(
        `/admin/words?lang=${lang}&pageSize=200`,
        {},
        token,
      );
      setWords(data.items);
    } catch {
      setError("Ma’lumotlarni yuklab bo‘lmadi. Qayta urinib ko‘ring.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, lang]);

  async function addWord(e: FormEvent) {
    e.preventDefault();
    if (!token || !newWord.trim()) return;
    await apiFetch(
      "/admin/words",
      { method: "POST", body: JSON.stringify({ text: newWord.trim(), lang }) },
      token,
    );
    setNewWord("");
    load();
  }

  async function toggleActive(w: AdminWord) {
    if (!token) return;
    await apiFetch(
      `/admin/words/${w.id}`,
      { method: "PATCH", body: JSON.stringify({ isActive: !w.isActive }) },
      token,
    );
    load();
  }

  async function remove(id: string) {
    if (!token) return;
    await apiFetch(`/admin/words/${id}`, { method: "DELETE" }, token);
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
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex overflow-hidden rounded-md border border-surface-border text-sm">
          {(["en", "uz"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 ${
                lang === l
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:bg-surface"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            setError(null);
            void addWord(e).catch(() =>
              setError("So‘z qo‘shilmadi. Qayta urinib ko‘ring."),
            );
          }}
          className="flex gap-2"
        >
          <input
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="So'z qo'shish…"
            aria-label="Yangi so‘z"
            className="rounded-md border border-surface-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground"
          >
            Qo‘shish
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-muted">Yuklanmoqda…</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {words.map((w) => (
            <span
              key={w.id}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${
                w.isActive
                  ? "border-surface-border"
                  : "border-surface-border/50 text-muted line-through"
              }`}
            >
              {w.text}
              <button
                onClick={() => {
                  setError(null);
                  void toggleActive(w).catch(() =>
                    setError("Amal bajarilmadi. Qayta urinib ko‘ring."),
                  );
                }}
                className="text-xs text-muted hover:text-accent"
                title={
                  w.isActive ? "Testlardan yashirish" : "Testlarda ko'rsatish"
                }
              >
                {w.isActive ? "Yashirish" : "Ko'rsatish"}
              </button>
              <button
                onClick={() => {
                  setError(null);
                  void remove(w.id).catch(() =>
                    setError("Amal bajarilmadi. Qayta urinib ko‘ring."),
                  );
                }}
                className="text-xs text-muted hover:text-error"
                title="O'chirish"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
