import { Prisma } from "@prisma/client";
import { z } from "zod";
import { calculateShippingInPaise, paiseToRupees } from "../lib/money.js";
import { prisma } from "../lib/prisma.js";

const MAX_CART_QUANTITY = 10;

export const addCartItemSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  size: z.number().positive("Size is required."),
  quantity: z.number().int().min(1).max(MAX_CART_QUANTITY).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(MAX_CART_QUANTITY),
});

export class CartServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "CartServiceError";
  }
}

type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            sizes: true;
          };
        };
      };
    };
  };
}>;

export async function getCartForUser(userId: string) {
  const cart = await getOrCreateActiveCart(userId);
  return serializeCart(cart);
}

export async function addCartItem(
  userId: string,
  input: z.infer<typeof addCartItemSchema>,
) {
  const cart = await getOrCreateActiveCart(userId);
  await assertValidProductSize(input.productId, input.size);

  await prisma.cartItem.upsert({
    where: {
      cartId_productId_size: {
        cartId: cart.id,
        productId: input.productId,
        size: new Prisma.Decimal(input.size),
      },
    },
    create: {
      cartId: cart.id,
      productId: input.productId,
      size: new Prisma.Decimal(input.size),
      quantity: input.quantity,
    },
    update: {
      quantity: {
        increment: input.quantity,
      },
    },
  });

  await clampCartItemQuantity(cart.id, input.productId, input.size);
  return getCartForUser(userId);
}

export async function updateCartItem(userId: string, itemId: string, quantity: number) {
  const cart = await findActiveCart(userId);
  if (!cart) throw new CartServiceError(404, "Cart item not found.");

  const item = cart.items.find((line) => line.id === itemId);
  if (!item) throw new CartServiceError(404, "Cart item not found.");

  await assertValidProductSize(item.productId, Number(item.size));

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  return getCartForUser(userId);
}

export async function removeCartItem(userId: string, itemId: string) {
  const cart = await findActiveCart(userId);
  if (!cart || !cart.items.some((item) => item.id === itemId)) {
    throw new CartServiceError(404, "Cart item not found.");
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
  return getCartForUser(userId);
}

export async function clearCart(userId: string) {
  const cart = await findActiveCart(userId);

  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  return getCartForUser(userId);
}

async function getOrCreateActiveCart(userId: string): Promise<CartWithItems> {
  const existing = await findActiveCart(userId);
  if (existing) return existing;

  const cart = await prisma.cart.create({
    data: { userId },
  });

  return loadCart(cart.id);
}

async function findActiveCart(userId: string) {
  return prisma.cart.findFirst({
    where: { userId, status: "active" },
    orderBy: { createdAt: "desc" },
    include: cartInclude,
  });
}

async function loadCart(cartId: string): Promise<CartWithItems> {
  return prisma.cart.findUniqueOrThrow({
    where: { id: cartId },
    include: cartInclude,
  });
}

const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" as const },
    include: {
      product: {
        include: {
          sizes: true,
        },
      },
    },
  },
};

async function assertValidProductSize(productId: string, size: number) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { sizes: true },
  });

  if (!product) {
    throw new CartServiceError(404, "Product not found.");
  }

  const hasSize = product.sizes.some((productSize) => Number(productSize.value) === size);

  if (!hasSize) {
    throw new CartServiceError(400, "Selected size is not available for this product.");
  }
}

async function clampCartItemQuantity(cartId: string, productId: string, size: number) {
  const item = await prisma.cartItem.findUnique({
    where: {
      cartId_productId_size: {
        cartId,
        productId,
        size: new Prisma.Decimal(size),
      },
    },
  });

  if (item && item.quantity > MAX_CART_QUANTITY) {
    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: MAX_CART_QUANTITY },
    });
  }
}

export function serializeCart(cart: CartWithItems) {
  const lines = cart.items.map((item) => {
    const lineTotalInPaise = item.product.priceInPaise * item.quantity;

    return {
      id: item.id,
      productId: item.productId,
      slug: item.product.slug,
      name: item.product.name,
      brand: item.product.brand,
      image: item.product.image,
      price: paiseToRupees(item.product.priceInPaise),
      priceInPaise: item.product.priceInPaise,
      size: Number(item.size),
      quantity: item.quantity,
      lineTotal: paiseToRupees(lineTotalInPaise),
      lineTotalInPaise,
    };
  });
  const subtotalInPaise = lines.reduce((sum, line) => sum + line.lineTotalInPaise, 0);
  const shippingInPaise = calculateShippingInPaise(subtotalInPaise);
  const totalInPaise = subtotalInPaise + shippingInPaise;

  return {
    id: cart.id,
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: paiseToRupees(subtotalInPaise),
    subtotalInPaise,
    shipping: paiseToRupees(shippingInPaise),
    shippingInPaise,
    total: paiseToRupees(totalInPaise),
    totalInPaise,
  };
}
