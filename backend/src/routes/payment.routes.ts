import { Router } from "express";
import {
  createCheckoutSessionHandler,
  syncCheckoutSessionHandler,
} from "../controllers/stripe.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const paymentRouter = Router();

paymentRouter.post("/stripe/checkout-session", requireAuth, createCheckoutSessionHandler);
paymentRouter.post(
  "/stripe/checkout-session/:sessionId/sync",
  requireAuth,
  syncCheckoutSessionHandler,
);
