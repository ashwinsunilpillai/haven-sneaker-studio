import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const BCRYPT_ROUNDS = 12;

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type SignupInput = z.infer<typeof signupSchema>;
type LoginInput = z.infer<typeof loginSchema>;

export class AuthServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

export async function signup(input: SignupInput) {
  const email = normalizeEmail(input.email);
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AuthServiceError(409, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email,
        passwordHash,
      },
    });

    return serializeUser(user);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AuthServiceError(409, "An account with this email already exists.");
    }

    throw error;
  }
}

export async function login(input: LoginInput) {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw invalidCredentialsError();
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw invalidCredentialsError();
  }

  return serializeUser(user);
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ? serializeUser(user) : null;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function invalidCredentialsError() {
  return new AuthServiceError(401, "Invalid email or password.");
}

function serializeUser(user: {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
