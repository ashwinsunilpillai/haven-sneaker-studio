import type { Auction, AuctionStatus, Bid, Product } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import {
  emitAuctionLifecycle,
  emitAuctionState,
  emitBidPlaced,
  type AuctionLifecyclePayload,
  type AuctionSocketStatePayload,
} from "../lib/auction-socket.js";

interface PlaceAuctionBidInput {
  auctionId: string;
  userId: string;
  amount: number;
}

interface AuctionSummary {
  auctionId: string;
  productId: string;
  currentBid: number;
  bidCount: number;
  auctionStatus: AuctionStatus;
  auctionStartsAt: string;
  auctionEndsAt: string;
  updatedAt: string;
}

const auctionInclude = {
  product: true,
  bids: {
    orderBy: { amountInPaise: "desc" as const },
    take: 1,
  },
  _count: {
    select: { bids: true },
  },
};

export async function listAuctions() {
  await syncAuctionLifecycle();

  const auctions = await prisma.auction.findMany({
    where: { status: { in: ["live", "scheduled"] } },
    include: auctionInclude,
    orderBy: { endsAt: "asc" as const },
  });

  return auctions.map(serializeAuction);
}

export async function getAuctionById(auctionId: string) {
  await syncAuctionLifecycle();

  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: auctionInclude,
  });

  return auction ? serializeAuction(auction) : null;
}

export async function getAuctionState(auctionId: string) {
  await syncAuctionLifecycle();

  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      bids: {
        orderBy: { amountInPaise: "desc" },
        take: 1,
      },
      _count: { select: { bids: true } },
    },
  });

  return auction ? serializeAuctionState(auction) : null;
}

export async function placeAuctionBid(input: PlaceAuctionBidInput) {
  const amountInPaise = Math.round(input.amount * 100);

  await syncAuctionLifecycle();

  return prisma.$transaction(async (tx) => {
    const auction = await tx.auction.findUnique({
      where: { id: input.auctionId },
      include: { bids: { orderBy: { amountInPaise: "desc" }, take: 1 } },
    });

    if (!auction) {
      throw new Error("Auction not found");
    }

    if (auction.status !== "live") {
      throw new Error("Auction is not currently live");
    }

    const now = new Date();

    if (now < auction.startsAt) {
      throw new Error("Auction has not started yet");
    }

    if (now >= auction.endsAt) {
      throw new Error("Auction has already ended");
    }

    const highestBid = auction.bids[0]?.amountInPaise ?? auction.startingBidInPaise;

    if (amountInPaise <= highestBid) {
      throw new Error("Bid must be higher than the current highest bid");
    }

    const bid = await tx.bid.create({
      data: {
        auctionId: auction.id,
        userId: input.userId,
        amountInPaise,
      },
    });

    const updatedAuction = await tx.auction.findUniqueOrThrow({
      where: { id: auction.id },
      include: {
        bids: {
          orderBy: { amountInPaise: "desc" },
          take: 1,
        },
        _count: { select: { bids: true } },
      },
    });

    const payload = serializeAuctionState(updatedAuction);
    const roomId = `auction:${auction.id}`;

    emitBidPlaced(payload, roomId);
    emitAuctionState(payload, roomId);

    return {
      auctionId: auction.id,
      productId: auction.productId,
      currentBid: payload.currentBid,
      bidCount: payload.bidCount,
      bidId: bid.id,
      status: payload.auctionStatus,
    };
  });
}

export async function syncAuctionLifecycle() {
  const now = new Date();

  // Transition scheduled -> live where startsAt <= now
  const started = await prisma.auction.updateMany({
    where: { status: "scheduled", startsAt: { lte: now } },
    data: { status: "live" },
  });

  if (started.count > 0) {
    const startedAuctions = await prisma.auction.findMany({
      where: { status: "live", startsAt: { lte: now } },
      select: { id: true },
    });

    for (const a of startedAuctions) {
      const payload = await buildLifecyclePayload(a.id, "auction:started");
      if (payload) {
        emitAuctionLifecycle(payload, `auction:${a.id}`);
        emitAuctionState(payload, `auction:${a.id}`);
      }
    }
  }

  // Transition live -> ended where endsAt <= now
  const ended = await prisma.auction.updateMany({
    where: { status: "live", endsAt: { lte: now } },
    data: { status: "ended" },
  });

  if (ended.count > 0) {
    const endedAuctions = await prisma.auction.findMany({
      where: { status: "ended", endsAt: { lte: now } },
      select: { id: true },
    });

    for (const a of endedAuctions) {
      const payload = await buildLifecyclePayload(a.id, "auction:ended");
      if (payload) {
        emitAuctionLifecycle(payload, `auction:${a.id}`);
        emitAuctionState(payload, `auction:${a.id}`);
      }
    }
  }
}

async function buildLifecyclePayload(
  auctionId: string,
  event: "auction:started" | "auction:ended",
) {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      bids: {
        orderBy: { amountInPaise: "desc" },
        take: 1,
      },
      _count: { select: { bids: true } },
    },
  });

  if (!auction) return null;

  const payload = serializeAuctionState(auction);
  return {
    ...payload,
    event,
  } as AuctionLifecyclePayload;
}

function serializeAuction(
  auction: Auction & {
    product: Product;
    bids: Bid[];
    _count: { bids: number };
  },
) {
  const summary = serializeAuctionState(auction);
  return {
    id: auction.product.id,
    slug: auction.product.slug,
    name: auction.product.name,
    brand: auction.product.brand,
    model: auction.product.model,
    description: auction.product.description,
    price: auction.product.priceInPaise / 100,
    priceInPaise: auction.product.priceInPaise,
    image: auction.product.image,
    gallery: auction.product.gallery,
    sizes: [],
    category: auction.product.category,
    isNew: auction.product.isNew,
    isAuction: true,
    currentBid: summary.currentBid,
    bidCount: summary.bidCount,
    auctionEndsAt: summary.auctionEndsAt,
    auctionStatus: summary.auctionStatus,
    auctionId: auction.id,
    auctionStartsAt: summary.auctionStartsAt,
  };
}

function serializeAuctionState(
  auction: Auction & {
    bids: Bid[];
    _count: { bids: number };
  },
): AuctionSummary & AuctionSocketStatePayload {
  const highestBid = auction.bids[0]?.amountInPaise ?? auction.startingBidInPaise;
  return {
    auctionId: auction.id,
    productId: auction.productId,
    currentBid: highestBid / 100,
    bidCount: auction._count.bids,
    auctionStatus: auction.status,
    auctionStartsAt: auction.startsAt.toISOString(),
    auctionEndsAt: auction.endsAt.toISOString(),
    updatedAt: auction.updatedAt.toISOString(),
  };
}
