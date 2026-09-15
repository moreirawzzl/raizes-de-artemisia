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

interface TagOption {
  id: string;
  name: string;
}

export function SearchSortBar({ availableTags = [] }: { availableTags?: TagOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  const hasFilters = !!(searchParams.get("q") || searchParams.get("tag") || searchParams.get("sort"));

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v) params.set(k, v); else params.delete(k);
    });
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function clearFilters() {
    setQ("");
    startTransition(() => router.push(pathname));
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); updateParams({ q: e.target.value }); }}
        placeholder="Buscar produto..."
        className="min-w-[220px] flex-1 rounded-full border border-bege-claro bg-white px-4 py-2.5 text-[13.5px] text-verde-principal outline-none focus:border-verde-secundario"
      />
      {availableTags.length > 0 && (
        <select
          value={searchParams.get("tag") ?? ""}
          onChange={(e) => updateParams({ tag: e.target.value })}
          className="rounded-full border border-bege-claro bg-white px-4 py-2.5 text-[12.5px] text-verde-principal outline-none"
        >
          <option value="">Todas as etiquetas</option>
          {availableTags.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
      )}
      <select
        defaultValue={searchParams.get("sort") ?? "relevancia"}
        onChange={(e) => updateParams({ sort: e.target.value })}
        className="rounded-full border border-bege-claro bg-white px-4 py-2.5 text-[12.5px] text-verde-principal outline-none"
      >
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="rounded-full border border-bege-claro px-4 py-2.5 text-[12.5px] text-verde-secundario underline hover:text-verde-principal"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
