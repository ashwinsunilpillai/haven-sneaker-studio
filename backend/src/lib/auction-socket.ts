import type { Server, Socket } from "socket.io";

let socketServer: Server | null = null;

export function setSocketServer(server: Server) {
  socketServer = server;
}

export function getSocketServer() {
  return socketServer;
}

export interface AuctionSocketStatePayload {
  auctionId: string;
  productId: string;
  currentBid: number;
  bidCount: number;
  auctionStatus: "scheduled" | "live" | "ended" | "cancelled";
  auctionStartsAt: string;
  auctionEndsAt: string;
  updatedAt: string;
}

export interface AuctionLifecyclePayload extends AuctionSocketStatePayload {
  event: "auction:started" | "auction:ended";
}

export function emitAuctionState(payload: AuctionSocketStatePayload, roomId: string) {
  socketServer?.to(roomId).emit("auction:state", payload);
}

export function emitAuctionLifecycle(payload: AuctionLifecyclePayload, roomId: string) {
  socketServer?.to(roomId).emit(payload.event, payload);
}

export function emitBidPlaced(payload: AuctionSocketStatePayload, roomId: string) {
  socketServer?.to(roomId).emit("bid:placed", payload);
}

export function joinAuctionRoom(socket: Socket, auctionId: string) {
  if (!auctionId) return;
  socket.join(`auction:${auctionId}`);
}

export function leaveAuctionRoom(socket: Socket, auctionId: string) {
  if (!auctionId) return;
  socket.leave(`auction:${auctionId}`);
}
