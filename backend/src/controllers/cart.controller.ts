import type { Request, Response } from "express";
import { ZodError } from "zod";
import {
  CartServiceError,
  addCartItem,
  addCartItemSchema,
  clearCart,
  getCartForUser,
  removeCartItem,
  updateCartItem,
  updateCartItemSchema,
} from "../services/cart.service.js";

export async function getCartHandler(req: Request, res: Response) {
  if (!req.auth) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const cart = await getCartForUser(req.auth.userId);
  res.json({ cart });
}

export async function addCartItemHandler(req: Request, res: Response) {
  if (!req.auth) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  try {
    const input = addCartItemSchema.parse(req.body);
    const cart = await addCartItem(req.auth.userId, input);
    res.status(201).json({ cart });
  } catch (error) {
    sendCartError(res, error);
  }
}

export async function updateCartItemHandler(req: Request, res: Response) {
  if (!req.auth) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  try {
    const itemId = readItemId(req);
    const input = updateCartItemSchema.parse(req.body);
    const cart = await updateCartItem(req.auth.userId, itemId, input.quantity);
    res.json({ cart });
  } catch (error) {
    sendCartError(res, error);
  }
}

export async function removeCartItemHandler(req: Request, res: Response) {
  if (!req.auth) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  try {
    const itemId = readItemId(req);
    const cart = await removeCartItem(req.auth.userId, itemId);
    res.json({ cart });
  } catch (error) {
    sendCartError(res, error);
  }
}

export async function clearCartHandler(req: Request, res: Response) {
  if (!req.auth) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const cart = await clearCart(req.auth.userId);
  res.json({ cart });
}

function readItemId(req: Request) {
  const itemId = req.params["itemId"];
  if (!itemId || Array.isArray(itemId)) {
    throw new CartServiceError(400, "Cart item is required.");
  }

  return itemId;
}

export function sendCartError(res: Response, error: unknown) {
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

  if (error instanceof CartServiceError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Internal server error" });
}
