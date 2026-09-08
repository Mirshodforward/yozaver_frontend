import { Analytics } from "@/components/Analytics";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Analitika" };
export default function AnalyticsPage() {
  return (
    <div className="page-stack">
      <div className="page-heading">
        <span className="eyebrow">SIZNING SHAXSIY RIVOJLANISHINGIZ</span>
        <h1>Har bir mashq hisobda.</h1>
        <p>
          Tezligingiz, aniqligingiz va odatlaringizni haqiqiy natijalar orqali
          kuzating.
        </p>
      </div>
      <Analytics />
    </div>
  );
}
