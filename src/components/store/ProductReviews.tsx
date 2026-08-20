interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { username: string; avatarUrl: string | null };
}

interface ProductReviewsProps {
  reviews: Review[];
  avg: number | null;
  count: number;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400">
      {"★".repeat(rating)}
      <span className="text-gray-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function ProductReviews({ reviews, avg, count }: ProductReviewsProps) {
  if (count === 0) return null;

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-display text-2xl text-verde-principal">Avaliações</h2>
        {avg !== null && (
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 text-lg">★</span>
            <span className="font-medium text-verde-principal">{avg.toFixed(1)}</span>
            <span className="text-xs text-bege-escuro">({count} avaliação{count > 1 ? "ões" : ""})</span>
          </div>
        )}
      </div>

      <ul className="space-y-4">
        {reviews.map((r) => (
          <li key={r.id} className="rounded-xl2 border border-bege-claro bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={r.user.avatarUrl || "/images/monogram.jpg"}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover border border-bege-claro"
                />
                <span className="text-sm font-medium text-verde-principal">{r.user.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <StarDisplay rating={r.rating} />
                <span className="text-[10px] text-bege-escuro">
                  {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
            {r.comment && (
              <p className="text-sm leading-relaxed text-[#5c5c50]">{r.comment}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
