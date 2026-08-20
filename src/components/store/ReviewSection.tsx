"use client";
import { useState } from "react";
import { ReviewForm } from "./ReviewForm";

interface OrderForReview {
  id: string;
  items: { productId: string; productName: string }[];
  reviewedProductIds: string[];
}

interface Props {
  deliveredOrders: OrderForReview[];
}

export function ReviewSection({ deliveredOrders }: Props) {
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());

  const pendingItems = deliveredOrders.flatMap((order) =>
    order.items
      .filter(
        (item) =>
          !order.reviewedProductIds.includes(item.productId) &&
          !reviewed.has(`${order.id}-${item.productId}`)
      )
      .map((item) => ({ ...item, orderId: order.id }))
  );

  if (pendingItems.length === 0) {
    return (
      <p className="text-sm text-verde-secundario">
        ✅ Todos os produtos foram avaliados. Obrigada!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {pendingItems.map(({ orderId, productId, productName }) => (
        <ReviewForm
          key={`${orderId}-${productId}`}
          orderId={orderId}
          productId={productId}
          productName={productName}
          onSuccess={() => {
            setReviewed((prev) => new Set(prev).add(`${orderId}-${productId}`));
          }}
        />
      ))}
    </div>
  );
}
