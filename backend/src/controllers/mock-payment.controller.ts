import type { Request, Response } from "express";
import { ZodError } from "zod";
import { OrderServiceError } from "../services/order.service.js";
import { confirmMockPayment, createMockOrderForUser } from "../services/mock-payment.service.js";

export async function createMockOrderHandler(req: Request, res: Response) {
  if (!req.auth) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  try {
    const order = await createMockOrderForUser(req.auth.userId, req.body);
    res.status(201).json({ order });
  } catch (error) {
    sendMockPaymentError(res, error);
  }
}

export async function confirmMockPaymentHandler(req: Request, res: Response) {
  if (!req.auth) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const orderId = req.params["orderId"];
  if (!orderId || Array.isArray(orderId)) {
    res.status(400).json({ error: "Order ID is required." });
    return;
  }

  try {
    const payment = await confirmMockPayment(req.auth.userId, orderId);
    res.json({ payment });
  } catch (error) {
    sendMockPaymentError(res, error);
  }
}

function sendMockPaymentError(res: Response, error: unknown) {
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

  if (error instanceof OrderServiceError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Internal server error" });
}
