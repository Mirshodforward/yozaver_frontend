"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  isBanned: boolean;
  createdAt: string;
  _count: { results: number };
}

export function UsersTab() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const timeout = setTimeout(() => {
      setLoading(true);
      setError(null);
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      apiFetch<{ items: AdminUser[] }>(`/admin/users${query}`, {}, token)
        .then((data) => setUsers(data.items))
        .catch(() =>
          setError("Foydalanuvchilar yuklanmadi. Qidiruvni qayta bajaring."),
        )
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [token, search]);

  async function reload() {
    if (!token) return;
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    const data = await apiFetch<{ items: AdminUser[] }>(
      `/admin/users${query}`,
      {},
      token,
    );
    setUsers(data.items);
  }

  async function toggleBan(u: AdminUser) {
    if (!token) return;
    await apiFetch(
      `/admin/users/${u.id}`,
      { method: "PATCH", body: JSON.stringify({ isBanned: !u.isBanned }) },
      token,
    );
    await reload();
  }

  async function toggleRole(u: AdminUser) {
    if (!token) return;
    const role = u.role === "ADMIN" ? "USER" : "ADMIN";
    await apiFetch(
      `/admin/users/${u.id}`,
      { method: "PATCH", body: JSON.stringify({ role }) },
      token,
    );
    await reload();
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
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Ism yoki email bo'yicha qidirish…"
        aria-label="Foydalanuvchilarni qidirish"
        className="w-full max-w-sm rounded-md border border-surface-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
      />

      {loading ? (
        <p className="text-muted">Yuklanmoqda…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-surface-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface/80 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Ism</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Testlar</th>
                <th className="px-4 py-3">Holat</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-surface-border/60">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3 text-muted">{u._count.results}</td>
                  <td className="px-4 py-3">
                    {u.isBanned ? (
                      <span className="text-error">Bloklangan</span>
                    ) : (
                      <span className="text-muted">Faol</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setError(null);
                          void toggleRole(u).catch(() =>
                            setError("Amal bajarilmadi. Qayta urinib ko‘ring."),
                          );
                        }}
                        className="rounded border border-surface-border px-2 py-1 text-xs whitespace-nowrap hover:border-accent/50"
                      >
                        {u.role === "ADMIN"
                          ? "Adminlikni bekor qilish"
                          : "Admin qilish"}
                      </button>
                      <button
                        onClick={() => {
                          setError(null);
                          void toggleBan(u).catch(() =>
                            setError("Amal bajarilmadi. Qayta urinib ko‘ring."),
                          );
                        }}
                        className="rounded border border-surface-border px-2 py-1 text-xs hover:border-accent/50"
                      >
                        {u.isBanned ? "Blokdan chiqarish" : "Bloklash"}
                      </button>
                    </div>
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
