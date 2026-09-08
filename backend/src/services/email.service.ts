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

export async function sendLoginNotificationEmail(user: { name: string; email: string }) {
  if (!isMailerConfigured()) {
    console.warn(`Mailer not configured; skipping login notification email for ${user.email}.`);
    return;
  }

  const mailer = getMailer();
  if (!mailer) return;

  const timestamp = new Date().toISOString();
  const text = [
    `Hi ${user.name},`,
    "",
    "This is a notification that your Haven account was just used to log in.",
    `Account: ${user.email}`,
    `Time: ${timestamp}`,
    "",
    "If this was not you, please secure your account by changing your password.",
  ].join("\n");

  await mailer.sendMail({
    from: getMailFromAddress(),
    to: user.email,
    subject: "Haven login notification",
    text,
  });
}

export async function sendAuctionWonEmail(auctionId: string) {
  if (!isMailerConfigured()) {
    console.warn(`Mailer not configured; skipping auction won email for ${auctionId}.`);
    return;
  }

  const mailer = getMailer();
  if (!mailer) return;

  const claimed = await prisma.auction.updateMany({
    where: { id: auctionId, status: "ended", auctionWonEmailSentAt: null },
    data: { auctionWonEmailSentAt: new Date() },
  });

  if (claimed.count === 0) return;

  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      product: true,
      bids: {
        orderBy: { amountInPaise: "desc" },
        take: 1,
        include: { user: true },
      },
    },
  });

  const winningBid = auction?.bids[0];
  if (!auction || !winningBid?.user?.email) {
    console.warn(`No email recipient for auction ${auctionId}; skipping auction won email.`);
    return;
  }

  const winnerName = winningBid.user.name;
  const winningAmount = formatInr(winningBid.amountInPaise);
  const text = [
    `Hi ${winnerName},`,
    "",
    `Congratulations, you won the Haven auction for ${auction.product.brand} ${auction.product.name}.`,
    "",
    `Winning bid: ${winningAmount}`,
    `Auction ID: ${auction.id}`,
    "",
    "We will contact you with the next steps for completing your purchase.",
  ].join("\n");

  await mailer.sendMail({
    from: getMailFromAddress(),
    to: winningBid.user.email,
    subject: `You won the Haven auction — ${auction.product.name}`,
    text,
  });
}
