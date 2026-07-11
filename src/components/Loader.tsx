"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

/** Loader inicial animado com o monograma da marca, some após a home carregar */
export function Loader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1200);
    const hideTimer = setTimeout(() => setVisible(false), 1850);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-fundo transition-opacity duration-700 ${fading ? "opacity-0" : "opacity-100"}`}
    >
      <div className="animate-pulse">
        <Image src="/images/monogram.jpg" alt="Raízes de Artemísia" width={110} height={110} className="animate-[breathe_2.4s_ease-in-out_infinite]" />
      </div>
      <div className="mt-7 h-[2px] w-[180px] overflow-hidden rounded-full bg-bege-claro">
        <div className="h-full w-full origin-left scale-x-0 animate-[fillbar_1.6s_ease_forwards] bg-verde-principal" />
      </div>
      <p className="mt-4 text-[11px] tracking-[3px] uppercase text-verde-secundario font-body">
        Raízes de Artemísia
      </p>
      <style>{`
        @keyframes breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes fillbar { to { transform: scaleX(1); } }
      `}</style>
    </div>
  );
}
