"use client";
import { useCallback, useEffect, useRef, useState } from "react";

import type { MusicId } from "@/lib/preferences";
const DEFAULT_VOLUME = 0.45;
type PlaybackState = "idle" | "loading" | "playing" | "paused" | "error";

/** Native media playback keeps the loop running without a JavaScript note timer. */
export function useAmbientMusic() {
  const [state, setState] = useState<PlaybackState>("idle");
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [error, setError] = useState("");
  const [activeTrack, setActiveTrack] = useState<MusicId>("sokin-ohang");
  const trackRef = useRef<MusicId>("sokin-ohang");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef(DEFAULT_VOLUME);
  const requestedRef = useRef(false);
  const lifecycleRef = useRef({ request: 0 });

  useEffect(() => {
    const lifecycle = lifecycleRef.current;
    // React can replay this effect during development; reconcile the UI too.
    setState("idle");
    return () => {
      lifecycle.request++;
      requestedRef.current = false;
      const audio = audioRef.current;
      audioRef.current = null;
      if (audio) {
        audio.onplaying =
          audio.onpause =
          audio.onwaiting =
          audio.onerror =
            null;
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        audio.remove();
      }
    };
  }, []);

  const stop = useCallback(() => {
    lifecycleRef.current.request++;
    requestedRef.current = false;
    audioRef.current?.pause();
    setState("paused");
  }, []);

  const playTrack = useCallback(async (track: MusicId) => {
    if (
      audioRef.current?.dataset.track === track &&
      !audioRef.current.paused &&
      requestedRef.current
    )
      return;
    const request = ++lifecycleRef.current.request;
    requestedRef.current = true;
    setError("");
    setState("loading");
    let audio = audioRef.current;
    if (audio && audio.dataset.track !== track) {
      audio.onplaying = audio.onpause = audio.onwaiting = audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audio.remove();
      audioRef.current = null;
      audio = null;
    }
    trackRef.current = track;
    setActiveTrack(track);
    try {
      if (!audio) {
        audio = new Audio(`/audio/${track}.wav`);
        audio.dataset.track = track;
        audio.loop = true;
        audio.preload = "none";
        audio.hidden = true;
        audio.dataset.yozaverMusic = "true";
        audio.setAttribute("aria-hidden", "true");
        audioRef.current = audio;
        document.body.appendChild(audio);
        const current = audio;
        current.onplaying = () => {
          if (
            audioRef.current !== current ||
            current.paused ||
            !requestedRef.current
          )
            return;
          setState("playing");
          setError("");
        };
        current.onpause = () => {
          if (audioRef.current !== current || !current.paused) return;
          requestedRef.current = false;
          setState("paused");
        };
        current.onwaiting = () => {
          if (
            audioRef.current === current &&
            requestedRef.current &&
            !current.paused
          )
            setState("loading");
        };
        current.onerror = () => {
          if (audioRef.current !== current) return;
          requestedRef.current = false;
          setState("error");
          setError(
            "Musiqa yuklanmadi. Musiqa tugmasini bosib qayta urinib ko‘ring.",
          );
        };
      }
      if (audioRef.current) {
        audioRef.current.volume = volumeRef.current;
        audioRef.current.muted = false;
      }
      if (audio.error) audio.load();
      // Call directly inside the user's click, before awaiting anything.
      await audio.play();
      if (
        lifecycleRef.current.request !== request ||
        audioRef.current !== audio
      )
        return;
      if (!audio.paused) setState("playing");
    } catch (cause) {
      if (
        lifecycleRef.current.request !== request ||
        audioRef.current !== audio
      )
        return;
      requestedRef.current = false;
      setState("error");
      setError(
        cause instanceof DOMException && cause.name === "NotAllowedError"
          ? "Brauzer ovozni to‘xtatdi. Musiqa tugmasini yana bir marta bosing."
          : "Musiqa yuklanmadi. Musiqa tugmasini bosib qayta urinib ko‘ring.",
      );
    }
  }, []);
  const toggle = useCallback(
    async (track: MusicId = trackRef.current) => {
      if (requestedRef.current && trackRef.current === track) {
        stop();
        return;
      }
      await playTrack(track);
    },
    [stop, playTrack],
  );

  const setVolume = useCallback((value: number) => {
    const next = Number.isFinite(value)
      ? Math.min(1, Math.max(0, value))
      : DEFAULT_VOLUME;
    volumeRef.current = next;
    setVolumeState(next);
    if (audioRef.current) audioRef.current.volume = next;
  }, []);

  return {
    playing: state === "playing",
    loading: state === "loading",
    volume,
    error,
    toggle,
    setVolume,
    playTrack,
    stop,
    activeTrack,
  };
}
