import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

import { useCart } from "@/context/CartContext";

export function CartIcon() {
  const { count } = useCart();

  return (
    <Link
      to="/cart"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      className="relative inline-flex size-10 items-center justify-center rounded-sm transition-colors hover:bg-secondary"
    >
      <ShoppingBag aria-hidden="true" className="size-5" />
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-live px-1 text-[0.65rem] font-bold text-live-foreground">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
