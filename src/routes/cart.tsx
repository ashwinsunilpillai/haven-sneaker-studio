import { createFileRoute, Link } from "@tanstack/react-router";

import { CartItem } from "@/components/CartItem";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/haven-button";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Haven" },
      { name: "description", content: "Review the sneakers in your Haven cart before checkout." },
      { property: "og:title", content: "Your cart — Haven" },
      {
        property: "og:description",
        content: "Review your selected pairs and proceed to checkout.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/cart" },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, shipping, total, removeLine, setQuantity } = useCart();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[100rem] px-5 py-12 md:px-8 md:py-20">
        <h1 className="display text-[clamp(2.5rem,8vw,6rem)]">CART</h1>

        {lines.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-6 border-t border-border py-24 text-center">
            <p className="text-lg text-muted-foreground">Your cart is empty.</p>
            <Button size="lg" asChild>
              <Link to="/">Shop sneakers</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
            <ul className="border-t border-border">
              {lines.map((line) => (
                <CartItem
                  key={line.id}
                  line={line}
                  onQuantityChange={setQuantity}
                  onRemove={removeLine}
                />
              ))}
            </ul>

            <aside className="h-fit rounded-sm border border-border bg-card p-6 lg:sticky lg:top-28">
              <h2 className="display text-2xl">ORDER SUMMARY</h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-semibold">{formatINR(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="font-semibold">{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-semibold">{formatINR(total)}</dd>
                </div>
              </dl>
              <Button size="lg" block className="mt-6" asChild>
                <Link to="/checkout">Proceed to checkout</Link>
              </Button>
              <p className="mt-4 text-xs text-muted-foreground">
                Free shipping on orders over {formatINR(25000)}.
              </p>
            </aside>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
