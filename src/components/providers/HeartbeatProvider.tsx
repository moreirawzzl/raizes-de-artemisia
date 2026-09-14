"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

// Intervalo de "batida". Precisa bater com o limiar considerado ONLINE_THRESHOLD_MS
// em src/lib/format.ts (lá o limiar é maior que este intervalo, com folga).
const HEARTBEAT_INTERVAL_MS = 45_000;

export function HeartbeatProvider() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    const send = () => {
      if (document.visibilityState === "visible") {
        fetch("/api/heartbeat", { method: "POST" }).catch(() => {});
      }
    };

    send(); // primeira batida assim que a página carrega
    const interval = setInterval(send, HEARTBEAT_INTERVAL_MS);

    // batida extra quando o usuário volta pra aba (ex: estava em outra guia)
    document.addEventListener("visibilitychange", send);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", send);
    };
  }, [status]);

  return null;
}
