import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { products } from "../../src/data/products.js";

const prisma = new PrismaClient();

const FALLBACK_AUCTION_MINUTES = 7 * 24 * 60;

function toPaise(amount: number) {
  return Math.round(amount * 100);
}

function seededAuctionEnd(auctionEndsAt?: string) {
  const parsed = auctionEndsAt ? new Date(auctionEndsAt) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) return parsed;
  return new Date(Date.now() + FALLBACK_AUCTION_MINUTES * 60_000);
}

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      create: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        model: product.model,
        description: product.description,
        priceInPaise: toPaise(product.price),
        image: product.image,
        gallery: product.gallery ?? [],
        category: product.category,
        isNew: product.isNew ?? false,
        sizes: {
          create: product.sizes.map((size) => ({ value: size })),
        },
      },
      update: {
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        model: product.model,
        description: product.description,
        priceInPaise: toPaise(product.price),
        image: product.image,
        gallery: product.gallery ?? [],
        category: product.category,
        isNew: product.isNew ?? false,
        sizes: {
          deleteMany: {},
          create: product.sizes.map((size) => ({ value: size })),
        },
      },
    });

    if (product.isAuction) {
      await prisma.auction.upsert({
        where: { productId: product.id },
        create: {
          productId: product.id,
          startingBidInPaise: toPaise(product.currentBid ?? product.price),
          endsAt: seededAuctionEnd(product.auctionEndsAt),
        },
        update: {
          startingBidInPaise: toPaise(product.currentBid ?? product.price),
          endsAt: seededAuctionEnd(product.auctionEndsAt),
        },
      });
    } else {
      await prisma.auction.deleteMany({ where: { productId: product.id } });
    }
  }

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
