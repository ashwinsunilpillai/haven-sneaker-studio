import { useState } from "react";

import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
}

export function ProductImageGallery({ images, alt }: ProductImageGalleryProps) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-sm border border-border bg-surface">
        <img
          src={current}
          alt={alt}
          width={1240}
          height={886}
          className="aspect-[4/3] w-full object-contain p-6 transition-transform duration-700 ease-[var(--ease-out-soft)] hover:scale-105 md:aspect-square"
        />
      </div>

      {images.length > 1 ? (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-current={index === active}
              className={cn(
                "w-20 overflow-hidden rounded-sm border bg-surface transition-colors",
                index === active ? "border-foreground" : "border-border hover:border-foreground/50",
              )}
            >
              <img
                src={image}
                alt=""
                width={1240}
                height={886}
                loading="lazy"
                className="aspect-square w-full object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
