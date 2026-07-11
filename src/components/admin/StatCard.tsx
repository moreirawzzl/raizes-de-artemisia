export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl2 border border-bege-claro bg-white p-5">
      <p className="text-[11px] uppercase tracking-wide text-verde-secundario">{label}</p>
      <p className="mt-1 font-display text-3xl text-verde-principal">{value}</p>
    </div>
  );
}
