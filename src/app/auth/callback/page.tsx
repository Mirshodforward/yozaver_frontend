"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function CallbackHandler() {
  const params = useSearchParams();
  const router = useRouter();
  const { setToken } = useAuth();

  useEffect(() => {
    const token =
      new URLSearchParams(window.location.hash.slice(1)).get("token") ??
      params.get("token");
    if (token) {
      setToken(token);
    }
    router.replace("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <p className="text-center text-muted">Tizimga kirilmoqda…</p>;
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={<p className="text-center text-muted">Tizimga kirilmoqda…</p>}
    >
      <CallbackHandler />
    </Suspense>
  );
}
