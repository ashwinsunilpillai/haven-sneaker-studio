import type { User } from "@/lib/types";

const API_BASE_URL = "http://localhost:4000/api";

interface AuthResponse {
  user: User;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    // Some successful responses may not contain JSON.
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
        ? data.error
        : "Something went wrong.";

    throw new Error(message);
  }

  return data as T;
}

export async function login(email: string, password: string): Promise<User> {
  const data = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return data.user;
}

export async function signup(name: string, email: string, password: string): Promise<User> {
  const data = await request<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

  return data.user;
}

export async function me(): Promise<User | null> {
  try {
    const data = await request<AuthResponse>("/auth/me", {
      method: "GET",
    });

    return data.user;
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required.") {
      return null;
    }

    throw error;
  }
}

export async function logout(): Promise<void> {
  await request<{ success: boolean }>("/auth/logout", {
    method: "POST",
  });
}
