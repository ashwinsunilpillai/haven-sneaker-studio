import { prisma } from "../lib/prisma.js";
import { clearCart } from "./cart.service.js";
import { createOrderFromCart, createOrderSchema, OrderServiceError } from "./order.service.js";
import { sendOrderConfirmationEmail } from "./email.service.js";

export async function createMockOrderForUser(userId: string, input: unknown) {
  const parsed = createOrderSchema.parse(input);
  return createOrderFromCart(userId, parsed, { clearCart: false });
}

export async function confirmMockPayment(userId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true, status: true },
  });

  if (!order || order.userId !== userId) {
    throw new OrderServiceError(404, "Order not found.");
  }

  if (order.status === "paid") {
    return {
      orderId: order.id,
      status: order.status,
      alreadyProcessed: true,
      cart: await clearCartIfNeeded(userId, false),
    };
  }

  if (order.status !== "pending") {
    throw new OrderServiceError(409, "Order cannot be paid in its current state.");
  }

  const updated = await prisma.order.updateMany({
    where: { id: order.id, userId, status: "pending" },
    data: { status: "paid" },
  });

  if (updated.count === 0) {
    const current = await prisma.order.findUnique({
      where: { id: order.id },
      select: { status: true },
    });

    if (current?.status === "paid") {
      return {
        orderId: order.id,
        status: current.status,
        alreadyProcessed: true,
        cart: await clearCartIfNeeded(userId, false),
      };
    }

    throw new OrderServiceError(409, "Order could not be paid. Please try again.");
  }

  const cart = await clearCartIfNeeded(userId, true);
  void sendOrderConfirmationEmail(order.id).catch((error) => {
    console.error(`Failed to send order confirmation email for ${order.id}:`, error);
  });

  return {
    orderId: order.id,
    status: "paid" as const,
    alreadyProcessed: false,
    cart,
  };
}

async function clearCartIfNeeded(userId: string, shouldClear: boolean) {
  if (shouldClear) return clearCart(userId);

  return null;
}
