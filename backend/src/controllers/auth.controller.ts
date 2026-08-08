import type { Request, Response } from "express";
import { ZodError } from "zod";
import {
  AuthServiceError,
  getUserById,
  login,
  loginSchema,
  signup,
  signupSchema,
} from "../services/auth.service.js";
import { getAuthCookieName, getAuthCookieOptions, signAuthToken } from "../lib/auth.js";

export async function signupHandler(req: Request, res: Response) {
  try {
    const input = signupSchema.parse(req.body);
    const user = await signup(input);
    setAuthCookie(res, user.id);
    res.status(201).json({ user });
  } catch (error) {
    sendAuthError(res, error);
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const input = loginSchema.parse(req.body);
    const user = await login(input);
    setAuthCookie(res, user.id);
    res.json({ user });
  } catch (error) {
    sendAuthError(res, error);
  }
}

export async function meHandler(req: Request, res: Response) {
  if (!req.auth) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const user = await getUserById(req.auth.userId);

  if (!user) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  res.json({ user });
}

export function logoutHandler(_req: Request, res: Response) {
  res.clearCookie(getAuthCookieName(), getAuthCookieOptions());
  res.json({ success: true });
}

function setAuthCookie(res: Response, userId: string) {
  res.cookie(getAuthCookieName(), signAuthToken({ userId }), getAuthCookieOptions());
}

function sendAuthError(res: Response, error: unknown) {
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

  if (error instanceof AuthServiceError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Internal server error" });
}
