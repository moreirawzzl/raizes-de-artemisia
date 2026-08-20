"use client";
import { useState } from "react";

interface ReviewFormProps {
  orderId: string;
  productId: string;
  productName: string;
  onSuccess: () => void;
}

export function ReviewForm({ orderId, productId, productName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Selecione uma nota."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, productId, rating, comment })
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Erro ao enviar avaliação");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 rounded-xl border border-bege-claro bg-fundo p-4"
    >
      <p className="mb-3 text-sm font-medium text-verde-principal">{productName}</p>

      {/* Star selector */}
      <div className="mb-3 flex gap-1" role="group" aria-label="Nota">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
            className="text-2xl transition-transform hover:scale-110"
          >
            <span className={(hovered || rating) >= star ? "text-amber-400" : "text-gray-300"}>
              ★
            </span>
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-xs text-bege-escuro self-center">
            {["", "Ruim", "Regular", "Bom", "Ótimo", "Excelente"][rating]}
          </span>
        )}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comentário opcional..."
        rows={2}
        maxLength={500}
        className="w-full rounded-lg border border-bege-claro bg-white px-3 py-2 text-sm text-verde-principal outline-none focus:border-verde-secundario resize-none"
      />

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="mt-3 rounded-full bg-verde-principal px-5 py-2 text-xs text-white hover:bg-[#455a40] disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Enviar avaliação"}
      </button>
    </form>
  );
}
