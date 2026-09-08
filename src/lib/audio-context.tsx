"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useAmbientMusic } from "@/hooks/useAmbientMusic";
import { useSettings } from "./settings-context";
import { KeySoundPlayer } from "./key-sound";
import type { KeySoundId, MusicId } from "./preferences";

function useAudioController() {
  const { settings, updateSettings } = useSettings();
  const player = useAmbientMusic();
  const pathname = usePathname();
  const [previewTrack, setPreviewTrack] = useState<MusicId | null>(null);
  const [soundError, setSoundError] = useState("");
  const keyRef = useRef<KeySoundPlayer | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stop = player.stop;
  const playTrack = player.playTrack;
  const playerVolume = player.setVolume;
  const playerToggle = player.toggle;
  const clearPreview = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setPreviewTrack(null);
  }, []);
  useEffect(() => {
    playerVolume(settings.musicVolume);
  }, [settings.musicVolume, playerVolume]);
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      keyRef.current?.close();
      keyRef.current = null;
    },
    [],
  );
  useEffect(() => {
    if (pathname !== "/settings" && previewTrack) {
      clearPreview();
      stop();
    }
  }, [pathname, previewTrack, clearPreview, stop]);
  const playSound = useCallback((id: KeySoundId, volume: number) => {
    if (!keyRef.current) keyRef.current = new KeySoundPlayer();
    void keyRef.current
      .play(id, volume)
      .then(() => setSoundError(""))
      .catch(() =>
        setSoundError(
          "Tugma tovushi ijro etilmadi. Eshitish tugmasini qayta bosing.",
        ),
      );
  }, []);
  const playKey = useCallback(() => {
    if (settings.keySoundEnabled)
      playSound(settings.keySound, settings.keyVolume);
  }, [
    settings.keySoundEnabled,
    settings.keySound,
    settings.keyVolume,
    playSound,
  ]);
  const previewKey = useCallback(
    (id: KeySoundId) => playSound(id, settings.keyVolume || 0.6),
    [playSound, settings.keyVolume],
  );
  const previewMusic = useCallback(
    (id: MusicId) => {
      if (previewTrack === id) {
        clearPreview();
        stop();
        return;
      }
      clearPreview();
      stop();
      setPreviewTrack(id);
      void playTrack(id);
      timerRef.current = setTimeout(() => {
        stop();
        setPreviewTrack(null);
        timerRef.current = null;
      }, 12000);
    },
    [previewTrack, clearPreview, stop, playTrack],
  );
  const selectMusic = useCallback(
    (id: MusicId) => {
      clearPreview();
      updateSettings({ musicTrack: id });
      void playTrack(id);
    },
    [clearPreview, updateSettings, playTrack],
  );
  const toggle = useCallback(async () => {
    if (previewTrack) {
      clearPreview();
      stop();
      await playTrack(settings.musicTrack);
    } else await playerToggle(settings.musicTrack);
  }, [
    previewTrack,
    clearPreview,
    stop,
    playTrack,
    playerToggle,
    settings.musicTrack,
  ]);
  const setVolume = useCallback(
    (volume: number) => {
      playerVolume(volume);
      updateSettings({ musicVolume: volume });
    },
    [playerVolume, updateSettings],
  );
  return {
    playing: player.playing,
    loading: player.loading,
    error: player.error,
    activeTrack: player.activeTrack,
    previewTrack,
    volume: settings.musicVolume,
    toggle,
    setVolume,
    previewMusic,
    selectMusic,
    playKey,
    previewKey,
    soundError,
    stop: () => {
      clearPreview();
      stop();
    },
  };
}
type AudioValue = ReturnType<typeof useAudioController>;
const Context = createContext<AudioValue | null>(null);
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audio = useAudioController();
  const value = useMemo(() => audio, [audio]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAppAudio() {
  const value = useContext(Context);
  if (!value) throw new Error("AudioProvider is missing");
  return value;
}
