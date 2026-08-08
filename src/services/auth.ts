import type { User } from "@/lib/types";

/** Mock auth. Replace with real API calls (Express + httpOnly cookies) later. */

const STORAGE_KEY = "haven.auth.user";
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

export function readStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function persistUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(STORAGE_KEY);
}

export async function login(email: string, password: string): Promise<User> {
  await delay();
  if (password.length < 6) throw new Error("Incorrect email or password.");
  return {
    id: "u-mock-1",
    email,
    name: (email.split("@")[0] ?? "").replace(/[._-]/g, " ") || "Haven Member",
  };
}

export async function signup(name: string, email: string): Promise<User> {
  await delay();
  return { id: "u-mock-1", email, name };
}

export async function logout(): Promise<void> {
  await delay(150);
}
