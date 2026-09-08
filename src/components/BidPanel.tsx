import { useEffect, useState } from "react";

import { Button } from "@/components/ui/haven-button";
import { Input } from "@/components/ui/text-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Countdown } from "@/components/Countdown";
import { SizeSelector } from "@/components/SizeSelector";
import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/types";
import { minimumNextBid, placeBid } from "@/services/auctions";

interface BidPanelProps {
  product: Product | null;
  currentBid: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBidPlaced: (productId: string, amount: number, bidCount: number) => void;
}

/** Bid dialog. When Socket.IO lands, `onBidPlaced` becomes an emit + subscription. */
export function BidPanel({ product, currentBid, open, onOpenChange, onBidPlaced }: BidPanelProps) {
  const minimum = minimumNextBid(currentBid);
  const [amount, setAmount] = useState(String(minimum));
  const [size, setSize] = useState<number | null>(null);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(String(minimum));
      setSize(null);
      setError(undefined);
      setSuccess(undefined);
    }
  }, [open, minimum]);

  if (!product) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(amount);
    if (size === null) {
      setError("Please select a size first.");
      return;
    }
    if (!Number.isFinite(value) || value < minimum) {
      setError(`Minimum bid is ${formatINR(minimum)}.`);
      return;
    }
    setSubmitting(true);
    setError(undefined);
    setSuccess(undefined);
    try {
      const result = await placeBid(product.auctionId ?? product.id, value, size);
      onBidPlaced(product.id, result.currentBid, result.bidCount);
      setSuccess("Bid placed successfully. Bids cannot be cancelled once placed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place bid.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="display text-3xl uppercase">Place your bid</DialogTitle>
          <DialogDescription>
            {product.brand} {product.name}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-4 border-y border-border py-4">
          <div>
            <dt className="eyebrow text-muted-foreground">Current bid</dt>
            <dd className="display mt-1 text-2xl text-live">{formatINR(currentBid)}</dd>
          </div>
          <div className="text-right">
            <dt className="eyebrow text-muted-foreground">Time left</dt>
            <dd className="display mt-1 text-2xl">
              {product.auctionEndsAt ? <Countdown endsAt={product.auctionEndsAt} /> : "--:--:--"}
            </dd>
          </div>
        </dl>

        <form onSubmit={submit} className="space-y-4">
          <SizeSelector sizes={product.sizes} value={size} onChange={setSize} />
          <Input
            label="Your bid (INR)"
            type="number"
            inputMode="numeric"
            min={minimum}
            step={100}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            error={error}
            hint={`Minimum bid ${formatINR(minimum)}`}
          />
          <Button type="submit" variant="live" size="lg" block loading={submitting}>
            Confirm bid
          </Button>
          {success ? (
            <p className="rounded-sm border border-emerald-500/40 bg-emerald-500/5 px-3 py-2 text-xs font-medium text-emerald-700">
              {success}
            </p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
