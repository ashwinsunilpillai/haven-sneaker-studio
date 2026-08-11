import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getAuctionsHandler, placeBidHandler } from "../controllers/auction.controller.js";

export const auctionRouter = Router();

auctionRouter.get("/", getAuctionsHandler);
auctionRouter.post("/:auctionId/bids", requireAuth, placeBidHandler);
