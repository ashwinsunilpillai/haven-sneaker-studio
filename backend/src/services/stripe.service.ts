import type Stripe from "stripe";
import { prisma } from "../lib/prisma.js";
import { calculateShippingInPaise } from "../lib/money.js";
import { clearCart } from "./cart.service.js";
import { createOrderSchema, OrderServiceError } from "./order.service.js";
import { getStripeClient, getStripeWebhookSecret } from "../lib/stripe.js";

const STRIPE_CURRENCY = "inr";

export class StripeServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "StripeServiceError";
  }
}

export async function createCheckoutSessionForUser(userId: string, input: unknown) {
  const parsed = createOrderSchema.parse(input);
  const stripe = getStripeClient();

  if (!stripe) {
    throw new StripeServiceError(503, "Stripe is not configured.");
  }

  const orderDraft = await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findFirst({
      where: { userId, status: "active" },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              include: {
                sizes: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new OrderServiceError(400, "Cart is empty.");
    }

    for (const item of cart.items) {
      const validSize = item.product.sizes.some((size) => Number(size.value) === Number(item.size));

      if (!validSize) {
        throw new OrderServiceError(400, "Cart contains an unavailable size.");
      }

      if (item.quantity < 1) {
        throw new OrderServiceError(400, "Cart contains an invalid quantity.");
      }
    }

    const subtotalInPaise = cart.items.reduce(
      (sum, item) => sum + item.product.priceInPaise * item.quantity,
      0,
    );
    const shippingInPaise = calculateShippingInPaise(subtotalInPaise);
    const totalInPaise = subtotalInPaise + shippingInPaise;

    const order = await tx.order.create({
      data: {
        userId,
        status: "pending",
        subtotal: subtotalInPaise,
        shipping: shippingInPaise,
        total: totalInPaise,
        customerName: parsed.name.trim(),
        customerEmail: parsed.email.trim().toLowerCase(),
        customerPhone: parsed.phone.trim(),
        shippingAddress: parsed.address.trim(),
        shippingCity: parsed.city.trim(),
        shippingState: parsed.state.trim(),
        shippingPostalCode: parsed.postalCode.trim(),
        shippingCountry: parsed.country.trim(),
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
            unitPriceInPaise: item.product.priceInPaise,
          })),
        },
      },
    });

    return {
      orderId: order.id,
      customerEmail: parsed.email.trim().toLowerCase(),
      subtotalInPaise,
      shippingInPaise,
      totalInPaise,
      items: cart.items.map((item) => ({
        productName: item.product.name,
        brand: item.product.brand,
        quantity: item.quantity,
        unitPriceInPaise: item.product.priceInPaise,
      })),
    };
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: orderDraft.customerEmail,
      client_reference_id: orderDraft.orderId,
      metadata: {
        orderId: orderDraft.orderId,
        userId,
      },
      line_items: [
        ...orderDraft.items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: STRIPE_CURRENCY,
            unit_amount: item.unitPriceInPaise,
            product_data: {
              name: `${item.brand} ${item.productName}`,
            },
          },
        })),
        ...(orderDraft.shippingInPaise > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: STRIPE_CURRENCY,
                  unit_amount: orderDraft.shippingInPaise,
                  product_data: {
                    name: "Shipping",
                  },
                },
              },
            ]
          : []),
      ],
      success_url: `${getFrontendOrigin()}/checkout?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getFrontendOrigin()}/checkout?canceled=1`,
    });

    if (!session.url) {
      throw new StripeServiceError(500, "Stripe Checkout session could not be created.");
    }

    return {
      orderId: orderDraft.orderId,
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    await prisma.order.update({
      where: { id: orderDraft.orderId },
      data: { status: "cancelled" },
    });

    throw error;
  }
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string | undefined) {
  const stripe = getStripeClient();
  const webhookSecret = getStripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    throw new StripeServiceError(503, "Stripe webhook is not configured.");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature ?? "", webhookSecret);
  } catch {
    throw new StripeServiceError(400, "Invalid Stripe webhook signature.");
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await finalizePaidCheckoutSession(event.data.object as Stripe.Checkout.Session);
      break;
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed":
      await cancelExpiredCheckoutSession(event.data.object as Stripe.Checkout.Session);
      break;
    default:
      break;
  }
}

export async function syncCheckoutSessionForUser(userId: string, sessionId: string) {
  const stripe = getStripeClient();

  if (!stripe) {
    throw new StripeServiceError(503, "Stripe is not configured.");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.metadata?.["userId"] !== userId) {
    throw new StripeServiceError(403, "Checkout session does not belong to this user.");
  }

  if (session.payment_status === "paid") {
    await finalizePaidCheckoutSession(session);
  } else if (session.status === "expired") {
    await cancelExpiredCheckoutSession(session);
  }

  const orderId = session.metadata?.["orderId"];
  if (!orderId) {
    throw new StripeServiceError(404, "Order not found for checkout session.");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true },
  });

  if (!order) {
    throw new StripeServiceError(404, "Order not found.");
  }

  return {
    orderId: order.id,
    orderStatus: order.status,
    paymentStatus: session.payment_status,
  };
}

async function finalizePaidCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    return;
  }

  const orderId = session.metadata?.["orderId"];
  const userId = session.metadata?.["userId"];
  if (!orderId) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true, total: true },
  });

  if (!order) return;
  if (userId && order.userId !== userId) return;
  if (session.amount_total != null && order.total !== session.amount_total) {
    console.error(`Stripe amount mismatch for order ${orderId}.`);
    return;
  }

  const updated = await prisma.order.updateMany({
    where: { id: orderId, status: "pending" },
    data: { status: "paid" },
  });

  if (updated.count === 0) {
    return;
  }

  if (order.userId) {
    await clearCart(order.userId);
  }
}

async function cancelExpiredCheckoutSession(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.["orderId"];
  if (!orderId) return;

  await prisma.order.updateMany({
    where: { id: orderId, status: "pending" },
    data: { status: "cancelled" },
  });
}

function getFrontendOrigin() {
  return (process.env["FRONTEND_ORIGIN"] ?? "http://localhost:8080").replace(/\/$/, "");
}
