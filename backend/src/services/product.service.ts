import type { Auction, Bid, Product, ProductSize } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

type ProductWithRelations = Product & {
  sizes: ProductSize[];
  auction:
    | (Auction & {
        bids: Bid[];
        _count: { bids: number };
      })
    | null;
};

const productInclude = {
  sizes: {
    orderBy: { value: "asc" as const },
  },
  auction: {
    include: {
      bids: {
        orderBy: { amountInPaise: "desc" as const },
        take: 1,
      },
      _count: {
        select: { bids: true },
      },
    },
  },
};

export async function listProducts() {
  const products = await prisma.product.findMany({
    include: productInclude,
    orderBy: { createdAt: "asc" },
  });

  return products.map(serializeProduct);
}

export async function findProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });

  return product ? serializeProduct(product) : null;
}

function serializeProduct(product: ProductWithRelations) {
  const highestBid = product.auction?.bids[0]?.amountInPaise;
  const auctionBid = highestBid ?? product.auction?.startingBidInPaise;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    model: product.model,
    description: product.description,
    price: product.priceInPaise / 100,
    priceInPaise: product.priceInPaise,
    image: product.image,
    gallery: product.gallery,
    sizes: product.sizes.map((size) => Number(size.value)),
    category: product.category,
    isNew: product.isNew,
    isAuction: Boolean(product.auction),
    currentBid: auctionBid ? auctionBid / 100 : undefined,
    bidCount: product.auction?._count.bids ?? undefined,
    auctionEndsAt: product.auction?.endsAt.toISOString(),
  };
}
