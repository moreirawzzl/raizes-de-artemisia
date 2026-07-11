"use client";
import { useRouter } from "next/navigation";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  async function onDelete() {
    if (!confirm("Excluir este produto?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    router.refresh();
  }
  return <button onClick={onDelete} className="text-xs text-[#8a4a3a] underline">excluir</button>;
}
