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
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(String(minimum));
      setError(undefined);
    }
  }, [open, minimum]);

  if (!product) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value < minimum) {
      setError(`Minimum bid is ${formatINR(minimum)}.`);
      return;
    }
    setSubmitting(true);
    setError(undefined);
    try {
      const result = await placeBid(product.id, value);
      onBidPlaced(product.id, result.currentBid, result.bidCount);
      onOpenChange(false);
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
