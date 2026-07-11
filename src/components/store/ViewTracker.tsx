"use client";
import { useEffect } from "react";

/** Registra 1 visualização do produto assim que a página abre (uma vez por acesso) */
export function ViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    fetch(`/api/views/${productId}`, { method: "POST" }).catch(() => {});
  }, [productId]);
  return null;
}
