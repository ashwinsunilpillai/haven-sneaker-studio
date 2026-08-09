import type { Request, Response } from "express";
import { ZodError } from "zod";
import {
  OrderServiceError,
  createOrderFromCart,
  createOrderSchema,
  getSerializedEmptyCartForUser,
  listOrdersForUser,
} from "../services/order.service.js";

export async function listOrdersHandler(req: Request, res: Response) {
  if (!req.auth) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const orders = await listOrdersForUser(req.auth.userId);
  res.json({ orders });
}

export async function createOrderHandler(req: Request, res: Response) {
  if (!req.auth) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  try {
    const input = createOrderSchema.parse(req.body);
    const order = await createOrderFromCart(req.auth.userId, input);
    const cart = await getSerializedEmptyCartForUser(req.auth.userId);
    res.status(201).json({ order, cart });
  } catch (error) {
    sendOrderError(res, error);
  }
}

function sendOrderError(res: Response, error: unknown) {
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
