import type { Request, Response } from "express";
import { listAuctions, placeAuctionBid } from "../services/auction.service.js";

export async function getAuctionsHandler(_req: Request, res: Response) {
  const auctions = await listAuctions();
  res.json({ auctions });
}

export async function placeBidHandler(req: Request, res: Response) {
  if (!req.auth) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const auctionId = req.params["auctionId"];

  if (!auctionId || Array.isArray(auctionId)) {
    res.status(400).json({ error: "Auction ID is required." });
    return;
  }

  const amount = Number(req.body?.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    res.status(400).json({ error: "Valid bid amount is required." });
    return;
  }

  try {
    const result = await placeAuctionBid({ auctionId, userId: req.auth.userId, amount });
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }

    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
