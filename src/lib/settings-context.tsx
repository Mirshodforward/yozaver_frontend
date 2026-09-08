"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./auth-context";
import { usePreferences } from "./preferences";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
const PremiumBackground = dynamic(
  () => import("@/components/PremiumBackground"),
  { ssr: false },
);
import {
  prepareBackground,
  readBackground,
  writeBackground,
} from "./background-storage";

type SettingsValue = ReturnType<typeof usePreferences> & {
  background: { url: string; name: string; size: number } | null;
  uploadBackground: (file: File) => Promise<void>;
  removeBackground: () => Promise<void>;
};
const Context = createContext<SettingsValue | null>(null);
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const preferences = usePreferences();
  const { settings, updateSettings } = preferences;
  const { user } = useAuth();
  const pathname = usePathname();
  const [photo, setPhoto] = useState<{
    userId: string;
    blob: Blob;
    name: string;
  } | null>(null);
  const [imageUrl, setImageUrl] = useState<{ blob: Blob; url: string } | null>(
    null,
  );
  useEffect(() => {
    let canceled = false;
    if (user)
      readBackground(user.id)
        .then((data) => {
          if (!canceled)
            setPhoto(
              data
                ? { userId: user.id, blob: data.blob, name: data.name }
                : null,
            );
        })
        .catch(() => {
          if (!canceled) setPhoto(null);
        });
    return () => {
      canceled = true;
    };
  }, [user]);
  const ownPhoto = user && photo?.userId === user.id ? photo : null;
  useEffect(() => {
    if (!ownPhoto) return;
    const url = URL.createObjectURL(ownPhoto.blob);
    setImageUrl({ blob: ownPhoto.blob, url });
    return () => URL.revokeObjectURL(url);
  }, [ownPhoto]);
  const background = useMemo(
    () =>
      ownPhoto && imageUrl?.blob === ownPhoto.blob
        ? { url: imageUrl.url, name: ownPhoto.name, size: ownPhoto.blob.size }
        : null,
    [ownPhoto, imageUrl],
  );
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.dataset.motion = settings.reduceMotion ? "reduced" : "system";
    root.dataset.caret = settings.caret;
    root.dataset.smooth = settings.smoothText ? "true" : "false";
    root.style.setProperty("--practice-size", `${settings.fontSize}px`);
    root.style.setProperty(
      "--practice-family",
      settings.fontFamily === "mono"
        ? "var(--font-geist-mono), monospace"
        : "var(--font-geist-sans), sans-serif",
    );
  }, [
    settings.theme,
    settings.reduceMotion,
    settings.caret,
    settings.smoothText,
    settings.fontSize,
    settings.fontFamily,
  ]);
  const hasCustom = Boolean(background && settings.customBackground);
  useLayoutEffect(() => {
    document.documentElement.dataset.customBackground = hasCustom
      ? "true"
      : "false";
  }, [hasCustom]);
  const uploadBackground = useCallback(
    async (file: File) => {
      if (!user) throw new Error("Shaxsiy fon uchun hisobingizga kiring.");
      const data = await prepareBackground(file);
      await writeBackground(user.id, data);
      setPhoto({ userId: user.id, blob: data.blob, name: data.name });
      updateSettings({ customBackground: true });
    },
    [user, updateSettings],
  );
  const removeBackground = useCallback(async () => {
    if (!user) throw new Error("Hisobingizga kiring.");
    await writeBackground(user.id, null);
    setPhoto(null);
    updateSettings({ customBackground: false });
  }, [user, updateSettings]);
  const value = useMemo(
    () => ({ ...preferences, background, uploadBackground, removeBackground }),
    [preferences, background, uploadBackground, removeBackground],
  );
  return (
    <Context.Provider value={value}>
      {pathname === "/" &&
        !hasCustom &&
        settings.backgroundEffect !== "none" && (
          <PremiumBackground
            effect={settings.backgroundEffect}
            reduced={settings.reduceMotion}
          />
        )}
      {hasCustom && background && (
        <div className="custom-wallpaper" aria-hidden="true">
          <div
            style={{
              backgroundImage: `url("${background.url}")`,
              filter: `blur(${settings.backgroundBlur}px)`,
            }}
          />
          <span
            style={{
              backgroundColor: `rgba(9,17,35,${settings.backgroundDim})`,
            }}
          />
        </div>
      )}
      {children}
    </Context.Provider>
  );
}
export function useSettings() {
  const context = useContext(Context);
  if (!context) throw new Error("SettingsProvider is missing");
  return context;
}
