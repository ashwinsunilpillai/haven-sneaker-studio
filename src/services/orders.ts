import type { CartSnapshot } from "@/services/cart";

const API_BASE_URL = "http://localhost:4000/api";

export interface CheckoutInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CreateOrderResponse {
  order: {
    id: string;
    total: number;
  };
  cart: CartSnapshot;
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

export async function createOrder(input: CheckoutInput): Promise<CreateOrderResponse> {
  return request<CreateOrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
