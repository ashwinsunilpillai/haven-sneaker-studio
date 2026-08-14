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

const API_BASE_URL = "http://localhost:4000/api";

interface StripeCheckoutSessionResponse {
  checkoutSession: {
    orderId: string;
    sessionId: string;
    url: string;
  };
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

export async function createStripeCheckoutSession(
  input: CheckoutInput,
): Promise<StripeCheckoutSessionResponse["checkoutSession"]> {
  const data = await request<StripeCheckoutSessionResponse>("/payments/stripe/checkout-session", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return data.checkoutSession;
}

interface StripeCheckoutSyncResponse {
  checkoutSession: {
    orderId: string;
    orderStatus: string;
    paymentStatus: string | null;
  };
}

export async function syncStripeCheckoutSession(sessionId: string) {
  const data = await request<StripeCheckoutSyncResponse>(
    `/payments/stripe/checkout-session/${encodeURIComponent(sessionId)}/sync`,
    { method: "POST" },
  );

  return data.checkoutSession;
}
