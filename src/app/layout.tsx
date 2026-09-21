import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/auth-context";
import { BackgroundDecor } from "@/components/BackgroundDecor";
import { Navbar } from "@/components/Navbar";
import "./globals.css";
import "./settings.css";
import "./premium-backgrounds.css";
import "./atmosphere-backgrounds.css";
import { SettingsProvider } from "@/lib/settings-context";
import { AudioProvider } from "@/lib/audio-context";
const geistSans = localFont({
  src: "./fonts/geist-latin.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL("https://yozaver.uz"),
  title: {
    default: "Yozaver uz — Fikringiz tezligida yozing",
    template: "%s | Yozaver uz",
  },
  description:
    "O‘zbekcha va inglizcha yozish tezligini sinang. Bitta qatorli yozish testi, shaxsiy analitika va reyting. Har bir harfda o‘sish — Yozaver uz.",
  applicationName: "Yozaver uz",
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    siteName: "Yozaver uz",
    title: "Yozaver uz — Shunchaki yozaver.",
    description: "Bir qator. To‘liq diqqat. Har bir harfda o‘sish.",
    url: "https://yozaver.uz",
  },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <AuthProvider>
          <SettingsProvider>
            <AudioProvider>
              <BackgroundDecor />
              <a href="#main-content" className="skip-link">
                Asosiy qismga o‘tish
              </a>
              <Navbar />
              <main id="main-content" className="app-main">
                {children}
              </main>
            </AudioProvider>
          </SettingsProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
