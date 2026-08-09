import { Prisma } from "@prisma/client";
import { z } from "zod";
import { calculateShippingInPaise, paiseToRupees } from "../lib/money.js";
import { prisma } from "../lib/prisma.js";
import { serializeCart } from "./cart.service.js";

export const createOrderSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().min(5, "Phone is required."),
  address: z.string().trim().min(3, "Address is required."),
  city: z.string().trim().min(2, "City is required."),
  state: z.string().trim().min(2, "State is required."),
  postalCode: z.string().trim().min(3, "Postal code is required."),
  country: z.string().trim().min(2, "Country is required."),
});

export class OrderServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "OrderServiceError";
  }
}

type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

export async function listOrdersForUser(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: orderInclude,
  });

  return orders.map(serializeOrder);
}

export async function createOrderFromCart(
  userId: string,
  input: z.infer<typeof createOrderSchema>,
) {
  const order = await prisma.$transaction(async (tx) => {
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

    const createdOrder = await tx.order.create({
      data: {
        userId,
        status: "pending",
        subtotal: subtotalInPaise,
        shipping: shippingInPaise,
        total: totalInPaise,
        customerName: input.name.trim(),
        customerEmail: input.email.trim().toLowerCase(),
        customerPhone: input.phone.trim(),
        shippingAddress: input.address.trim(),
        shippingCity: input.city.trim(),
        shippingState: input.state.trim(),
        shippingPostalCode: input.postalCode.trim(),
        shippingCountry: input.country.trim(),
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
            unitPriceInPaise: item.product.priceInPaise,
          })),
        },
      },
      include: orderInclude,
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return createdOrder;
  });

  return serializeOrder(order);
}

export async function getSerializedEmptyCartForUser(userId: string) {
  const cart = await prisma.cart.findFirst({
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

  if (!cart) {
    const created = await prisma.cart.create({ data: { userId } });
    const empty = await prisma.cart.findUniqueOrThrow({
      where: { id: created.id },
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
    return serializeCart(empty);
  }

  return serializeCart(cart);
}

const orderInclude = {
  items: {
    orderBy: { id: "asc" as const },
    include: {
      product: true,
    },
  },
};

function serializeOrder(order: OrderWithItems) {
  return {
    id: order.id,
    status: order.status,
    subtotal: paiseToRupees(order.subtotal),
    subtotalInPaise: order.subtotal,
    shipping: paiseToRupees(order.shipping),
    shippingInPaise: order.shipping,
    total: paiseToRupees(order.total),
    totalInPaise: order.total,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: order.shippingAddress,
    shippingCity: order.shippingCity,
    shippingState: order.shippingState,
    shippingPostalCode: order.shippingPostalCode,
    shippingCountry: order.shippingCountry,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      slug: item.product.slug,
      name: item.product.name,
      brand: item.product.brand,
      image: item.product.image,
      size: Number(item.size),
      quantity: item.quantity,
      unitPrice: paiseToRupees(item.unitPriceInPaise),
      unitPriceInPaise: item.unitPriceInPaise,
      lineTotal: paiseToRupees(item.unitPriceInPaise * item.quantity),
      lineTotalInPaise: item.unitPriceInPaise * item.quantity,
    })),
  };
}
