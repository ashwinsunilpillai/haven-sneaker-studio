import { Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";

import { formatINR } from "@/lib/format";
import type { CartLine } from "@/lib/types";

interface CartItemProps {
  line: CartLine;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({ line, onQuantityChange, onRemove }: CartItemProps) {
  return (
    <li className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 border-b border-border py-6 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-center sm:gap-6">
      <Link to="/product/$slug" params={{ slug: line.slug }} className="block">
        <img
          src={line.image}
          alt={`${line.brand} ${line.name}`}
          width={320}
          height={240}
          loading="lazy"
          className="aspect-square w-full rounded-sm bg-surface object-contain p-2"
        />
      </Link>

      <div className="min-w-0">
        <p className="eyebrow text-muted-foreground">{line.brand}</p>
        <h3 className="truncate font-sans text-sm font-semibold">
          <Link to="/product/$slug" params={{ slug: line.slug }} className="hover:underline">
            {line.name}
          </Link>
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">Size UK {line.size}</p>
        <p className="mt-2 text-sm font-semibold">{formatINR(line.price)}</p>

        <div className="mt-3 flex items-center gap-3">
          <div className="inline-flex items-center rounded-sm border border-border">
            <button
              type="button"
              aria-label={`Decrease quantity of ${line.name}`}
              onClick={() => onQuantityChange(line.id, line.quantity - 1)}
              className="grid size-9 place-items-center hover:bg-secondary"
            >
              <Minus className="size-3.5" aria-hidden="true" />
            </button>
            <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
              {line.quantity}
            </span>
            <button
              type="button"
              aria-label={`Increase quantity of ${line.name}`}
              onClick={() => onQuantityChange(line.id, line.quantity + 1)}
              className="grid size-9 place-items-center hover:bg-secondary"
            >
              <Plus className="size-3.5" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(line.id)}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground hover:text-live"
          >
            <X className="size-3.5" aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>

      <p className="hidden text-right text-base font-semibold sm:block">
        {formatINR(line.price * line.quantity)}
      </p>
    </li>
  );
}
