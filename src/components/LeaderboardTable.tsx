import Link from "next/link";

export interface LeaderboardRow {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  wpm: number;
  accuracy: number;
  createdAt: string;
}

export function LeaderboardTable({
  rows,
  loading,
}: {
  rows: LeaderboardRow[];
  loading: boolean;
}) {
  if (loading)
    return (
      <div
        className="panel space-y-4 p-6"
        role="status"
        aria-label="Reyting yuklanmoqda"
      >
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex animate-pulse items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-accent/8" />
            <div className="h-3 w-1/3 rounded bg-accent/8" />
            <div className="ml-auto h-3 w-16 rounded bg-accent/8" />
          </div>
        ))}
      </div>
    );

  if (rows.length === 0)
    return (
      <div className="panel flex min-h-64 flex-col items-center justify-center p-8 text-center">
        <span
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-2xl text-accent"
          aria-hidden="true"
        >
          ↗
        </span>
        <h2 className="text-lg font-semibold">Birinchi o‘rin hali bo‘sh.</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
          Bu davr uchun natijalar hali yo‘q. Hisobingizga kiring, testni
          yakunlang va reytingni boshlab bering.
        </p>
        <Link href="/" className="secondary-button mt-5">
          Mashq qilish →
        </Link>
      </div>
    );

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-surface-border px-6 py-5">
        <h2 className="section-heading">Eng tez yozuvchilar</h2>
        <span className="text-xs text-muted">{rows.length} ishtirokchi</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-115 text-left text-sm">
          <thead className="bg-background/50 text-[10px] tracking-wide text-muted">
            <tr>
              <th className="px-6 py-4">O‘RIN</th>
              <th className="px-4 py-4">ISHTIROKCHI</th>
              <th className="px-4 py-4 text-right">TEZLIK</th>
              <th className="px-6 py-4 text-right">ANIQLIK</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.userId}
                className="border-t border-surface-border/70 transition-colors hover:bg-accent/3"
              >
                <td className="px-6 py-4">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${row.rank === 1 ? "bg-amber-100 text-amber-700" : row.rank <= 3 ? "bg-accent/10 text-accent" : "text-muted"}`}
                  >
                    {row.rank < 10 ? `0${row.rank}` : row.rank}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {row.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.avatarUrl}
                        alt=""
                        className="h-9 w-9 rounded-xl"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/8 text-xs font-semibold text-accent">
                        {row.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="font-medium">{row.name}</span>
                    {row.rank === 1 && (
                      <span className="hidden rounded-full bg-amber-50 px-2 py-1 text-[9px] font-semibold text-amber-700 sm:inline">
                        YETAKCHI
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-right text-lg font-semibold tracking-tight text-accent">
                  {row.wpm}
                  <span className="ml-1 text-[10px] font-normal text-muted">
                    wpm
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-xs font-medium">
                  {row.accuracy}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
