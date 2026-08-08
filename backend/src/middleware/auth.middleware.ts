import type { NextFunction, Request, Response } from "express";
import { getAuthCookieName, verifyAuthToken } from "../lib/auth.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[getAuthCookieName()];

  if (typeof token !== "string" || !token) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  try {
    const payload = verifyAuthToken(token);
    req.auth = { userId: payload.userId };
    next();
  } catch {
    res.status(401).json({ error: "Authentication required." });
  }
}
