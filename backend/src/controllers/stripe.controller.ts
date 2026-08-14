import type { Request, Response } from "express";
import { ZodError } from "zod";
import { OrderServiceError } from "../services/order.service.js";
import {
  StripeServiceError,
  createCheckoutSessionForUser,
  handleStripeWebhook,
  syncCheckoutSessionForUser,
} from "../services/stripe.service.js";

export async function createCheckoutSessionHandler(req: Request, res: Response) {
  if (!req.auth) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  try {
    const checkoutSession = await createCheckoutSessionForUser(req.auth.userId, req.body);
    res.status(201).json({ checkoutSession });
  } catch (error) {
    sendStripeError(res, error);
  }
}

export async function stripeWebhookHandler(req: Request, res: Response) {
  try {
    const signature = req.header("stripe-signature");
    await handleStripeWebhook(req.body as Buffer, signature);
    res.json({ received: true });
  } catch (error) {
    sendStripeError(res, error);
  }
}

export async function syncCheckoutSessionHandler(req: Request, res: Response) {
  if (!req.auth) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const sessionIdParam = req.params["sessionId"];
  const sessionId = Array.isArray(sessionIdParam) ? sessionIdParam[0] : sessionIdParam;
  if (!sessionId) {
    res.status(400).json({ error: "Checkout session id is required." });
    return;
  }

  try {
    const result = await syncCheckoutSessionForUser(req.auth.userId, sessionId);
    res.json({ checkoutSession: result });
  } catch (error) {
    sendStripeError(res, error);
  }
}

function sendStripeError(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed.",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof StripeServiceError || error instanceof OrderServiceError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Internal server error" });
}
