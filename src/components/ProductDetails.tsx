import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Countdown } from "@/components/Countdown";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { SizeSelector } from "@/components/SizeSelector";
import { Button } from "@/components/ui/haven-button";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/types";

interface ProductDetailsProps {
  product: Product;
  currentBid: number;
  bidCount: number;
  onBid: () => void;
}

export function ProductDetails({ product, currentBid, bidCount, onBid }: ProductDetailsProps) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [size, setSize] = useState<number | null>(null);
  const [sizeError, setSizeError] = useState<string>();

  const requireSize = () => {
    if (size === null) {
      setSizeError("Choose a size to continue.");
      return false;
    }
    setSizeError(undefined);
    return true;
  };

  const handleAdd = () => {
    if (!requireSize()) return;
    addToCart(product, size as number);
    toast.success(`${product.name} (UK ${size}) added to cart`);
  };

  const handleBuyNow = () => {
    if (!requireSize()) return;
    addToCart(product, size as number);
    navigate({ to: "/checkout" });
  };

  return (
    <div className="mx-auto max-w-[100rem] px-5 py-10 md:px-8 md:py-16">
      <nav aria-label="Breadcrumb" className="mb-8 text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductImageGallery
          images={product.gallery?.length ? product.gallery : [product.image]}
          alt={`${product.brand} ${product.name} sneaker, side profile`}
        />

        <div>
          <p className="eyebrow text-muted-foreground">{product.brand}</p>
          <h1 className="display mt-2 text-[clamp(2.5rem,7vw,4.5rem)]">{product.name}</h1>
          <p className="mt-3 text-2xl font-semibold">{formatINR(product.price)}</p>
          <p className="mt-5 max-w-prose text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {product.isAuction ? (
            <div className="mt-8 rounded-sm border border-live/30 bg-live/5 p-5">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="eyebrow text-muted-foreground">Current bid</dt>
                  <dd className="display mt-1 text-3xl text-live">{formatINR(currentBid)}</dd>
                  <dd className="text-xs text-muted-foreground">{bidCount} bids</dd>
                </div>
                <div className="text-right">
                  <dt className="eyebrow text-muted-foreground">Time left</dt>
                  <dd className="display mt-1 text-3xl">
                    {product.auctionEndsAt ? <Countdown endsAt={product.auctionEndsAt} /> : "--:--:--"}
                  </dd>
                </div>
              </dl>
              <Button variant="live" size="lg" block className="mt-5" onClick={onBid}>
                Bid higher
              </Button>
            </div>
          ) : null}

          <div className="mt-8">
            <SizeSelector sizes={product.sizes} value={size} onChange={setSize} error={sizeError} />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="sm:flex-1" onClick={handleAdd}>
              Add to cart
            </Button>
            <Button size="lg" variant="outline" className="sm:flex-1" onClick={handleBuyNow}>
              Buy now
            </Button>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-y-4 border-t border-border pt-8 text-sm">
            <dt className="text-muted-foreground">Model</dt>
            <dd className="text-right font-medium">{product.model}</dd>
            <dt className="text-muted-foreground">Category</dt>
            <dd className="text-right font-medium capitalize">{product.category}</dd>
            <dt className="text-muted-foreground">Condition</dt>
            <dd className="text-right font-medium">Deadstock</dd>
            <dt className="text-muted-foreground">Authentication</dt>
            <dd className="text-right font-medium">Verified by Haven</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
