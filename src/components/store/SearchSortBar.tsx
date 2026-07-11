"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "relevancia", label: "Relevância" },
  { value: "preco-asc", label: "Preço: menor → maior" },
  { value: "preco-desc", label: "Preço: maior → menor" },
  { value: "mais-vendidos", label: "Mais vendidos" },
  { value: "menos-vendidos", label: "Menos vendidos" },
  { value: "mais-vistos", label: "Mais vistos" },
  { value: "menos-vistos", label: "Menos vistos" },
  { value: "mais-recentes", label: "Mais recentes" },
  { value: "mais-antigos", label: "Mais antigos" },
  { value: "a-z", label: "A-Z" },
  { value: "z-a", label: "Z-A" }
];

export function SearchSortBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v) params.set(k, v); else params.delete(k);
    });
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); updateParams({ q: e.target.value }); }}
        placeholder="Buscar produto..."
        className="min-w-[220px] flex-1 rounded-full border border-bege-claro bg-white px-4 py-2.5 text-[13.5px] text-verde-principal outline-none focus:border-verde-secundario"
      />
      <select
        defaultValue={searchParams.get("sort") ?? "relevancia"}
        onChange={(e) => updateParams({ sort: e.target.value })}
        className="rounded-full border border-bege-claro bg-white px-4 py-2.5 text-[12.5px] text-verde-principal outline-none"
      >
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
