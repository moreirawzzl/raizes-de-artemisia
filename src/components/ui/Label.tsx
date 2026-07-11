export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] uppercase tracking-[1.5px] text-verde-secundario font-body">
      {children}
    </label>
  );
}
