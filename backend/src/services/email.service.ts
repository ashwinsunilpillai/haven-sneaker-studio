import { paiseToRupees } from "../lib/money.js";
import { getMailFromAddress, getMailer, isMailerConfigured } from "../lib/mailer.js";
import { prisma } from "../lib/prisma.js";

function formatInr(amountInPaise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paiseToRupees(amountInPaise));
}

function buildShippingAddress(order: {
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
}) {
  return [
    order.shippingAddress,
    order.shippingCity,
    order.shippingState,
    order.shippingPostalCode,
    order.shippingCountry,
  ]
    .filter(Boolean)
    .join(", ");
}

export async function sendOrderConfirmationEmail(orderId: string) {
  if (!isMailerConfigured()) {
    console.warn(`Mailer not configured; skipping confirmation email for order ${orderId}.`);
    return;
  }

  const mailer = getMailer();
  if (!mailer) {
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order?.customerEmail) {
    console.warn(`No customer email on order ${orderId}; skipping confirmation email.`);
    return;
  }

  const itemLines = order.items.map((item) => {
    const lineTotalInPaise = item.unitPriceInPaise * item.quantity;
    return `- ${item.product.brand} ${item.product.name} | UK ${Number(item.size)} | Qty ${item.quantity} | ${formatInr(lineTotalInPaise)}`;
  });

  const shippingAddress = buildShippingAddress(order);
  const customerName = order.customerName ?? "Customer";

  const text = [
    `Hi ${customerName},`,
    "",
    "Thanks for your order at Haven. Your payment was confirmed.",
    "",
    `Order ID: ${order.id}`,
    "",
    "Items:",
    ...itemLines,
    "",
    `Subtotal: ${formatInr(order.subtotal)}`,
    `Shipping: ${order.shipping === 0 ? "Free" : formatInr(order.shipping)}`,
    `Total: ${formatInr(order.total)}`,
    "",
    shippingAddress ? `Shipping to: ${shippingAddress}` : null,
    order.customerPhone ? `Phone: ${order.customerPhone}` : null,
    "",
    "We will notify you when your order ships.",
  ]
    .filter(Boolean)
    .join("\n");

  const htmlItems = order.items
    .map((item) => {
      const lineTotalInPaise = item.unitPriceInPaise * item.quantity;
      return `<li><strong>${item.product.brand} ${item.product.name}</strong><br/>UK ${Number(item.size)} · Qty ${item.quantity} · ${formatInr(lineTotalInPaise)}</li>`;
    })
    .join("");

  const html = `
    <p>Hi ${customerName},</p>
    <p>Thanks for your order at Haven. Your payment was confirmed.</p>
    <p><strong>Order ID:</strong> ${order.id}</p>
    <ul>${htmlItems}</ul>
    <p>
      <strong>Subtotal:</strong> ${formatInr(order.subtotal)}<br/>
      <strong>Shipping:</strong> ${order.shipping === 0 ? "Free" : formatInr(order.shipping)}<br/>
      <strong>Total:</strong> ${formatInr(order.total)}
    </p>
    ${shippingAddress ? `<p><strong>Shipping to:</strong> ${shippingAddress}</p>` : ""}
    ${order.customerPhone ? `<p><strong>Phone:</strong> ${order.customerPhone}</p>` : ""}
    <p>We will notify you when your order ships.</p>
  `;

  await mailer.sendMail({
    from: getMailFromAddress(),
    to: order.customerEmail,
    subject: `Haven order confirmed — ${order.id}`,
    text,
    html,
  });
}
