import type { CookieOptions } from "express";
import type { Secret, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";

const DEFAULT_JWT_EXPIRES_IN = "7d";
const DEFAULT_COOKIE_NAME = "haven_auth";
const DEFAULT_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

interface AuthTokenPayload {
  userId: string;
}

export function getAuthCookieName() {
  return process.env["AUTH_COOKIE_NAME"] ?? DEFAULT_COOKIE_NAME;
}

export function getAuthCookieOptions(): CookieOptions {
  const isProduction = process.env["NODE_ENV"] === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: getCookieMaxAgeMs(),
  };
}

export function signAuthToken(payload: AuthTokenPayload) {
  const expiresIn = (process.env["JWT_EXPIRES_IN"] ?? DEFAULT_JWT_EXPIRES_IN) as NonNullable<
    SignOptions["expiresIn"]
  >;
  const secret: Secret = getJwtSecret();

  return jwt.sign({}, secret, {
    subject: payload.userId,
    expiresIn,
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, getJwtSecret());

  if (typeof decoded === "string" || typeof decoded.sub !== "string") {
    throw new Error("Invalid auth token payload");
  }

  return { userId: decoded.sub };
}

function getJwtSecret() {
  const secret = process.env["JWT_SECRET"];

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return secret;
}

function getCookieMaxAgeMs() {
  const expiresIn = process.env["JWT_EXPIRES_IN"] ?? DEFAULT_JWT_EXPIRES_IN;
  const parsed = parseDurationMs(expiresIn);
  return parsed ?? DEFAULT_COOKIE_MAX_AGE_MS;
}

function parseDurationMs(value: string) {
  const match = value.trim().match(/^(\d+)([smhd])$/i);
  if (!match) return null;

  const amount = Number(match[1]);
  const unit = match[2]?.toLowerCase();

  if (!Number.isFinite(amount)) return null;

  switch (unit) {
    case "s":
      return amount * 1000;
    case "m":
      return amount * 60 * 1000;
    case "h":
      return amount * 60 * 60 * 1000;
    case "d":
      return amount * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}
