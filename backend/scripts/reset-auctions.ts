import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const START_PAST_MINUTES = 5;
const AUCTION_DURATION_DAYS = 7;

function formatDate(value: Date) {
  return value.toISOString();
}

async function main() {
  const auctions = await prisma.auction.findMany({
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      status: true,
      product: { select: { name: true } },
    },
  });

  if (auctions.length === 0) {
    console.log("No auctions found; nothing was changed.");
    return;
  }

  const startsAt = new Date(Date.now() - START_PAST_MINUTES * 60 * 1000);
  const durationMs = AUCTION_DURATION_DAYS * 24 * 60 * 60 * 1000;
  let changedCount = 0;

  for (const auction of auctions) {
    if (auction.status === "cancelled") {
      console.log(`${auction.id} | ${auction.product.name} | status=cancelled | unchanged`);
      continue;
    }

    const endsAt = new Date(startsAt.getTime() + durationMs);

    await prisma.auction.update({
      where: { id: auction.id },
      data: { status: "live", startsAt, endsAt },
    });
    changedCount += 1;

    console.log(
      `${auction.id} | ${auction.product.name} | status=live | startsAt=${formatDate(startsAt)} | endsAt=${formatDate(endsAt)}`,
    );
  }

  console.log(`Reset ${changedCount} auction(s); cancelled auctions were left untouched.`);
  console.log("Only status, startsAt, and endsAt were changed; no auctions were created or deleted.");
}

main()
  .catch((error) => {
    console.error("Auction time reset failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
