"use client";
import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

interface ProductImage {
  id: string;
  url: string;
}

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  return (
    <>
      <div className="product-image-main relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={active?.id ?? "placeholder"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={active?.url || "/images/monogram.jpg"}
              alt={productName}
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-contain"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={`relative h-16 w-16 overflow-hidden rounded-lg border bg-bege-claro transition-all ${
                i === activeIndex ? "border-verde-principal ring-1 ring-verde-principal" : "border-bege-claro opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
