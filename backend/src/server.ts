import "dotenv/config";
import http from "node:http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { setSocketServer, joinAuctionRoom, leaveAuctionRoom } from "./lib/auction-socket.js";
import { getAuctionState, syncAuctionLifecycle } from "./services/auction.service.js";

const port = Number(process.env["PORT"] ?? 4000);
const app = createApp();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env["FRONTEND_ORIGIN"],
    credentials: true,
  },
});

setSocketServer(io);

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  void syncAuctionLifecycle();

  socket.on("auction:join", async ({ auctionId }: { auctionId?: string }) => {
    if (typeof auctionId !== "string" || !auctionId) return;

    joinAuctionRoom(socket, auctionId);
    const state = await getAuctionState(auctionId);
    if (state) {
      socket.emit("auction:state", state);
    }
  });

  socket.on("auction:leave", ({ auctionId }: { auctionId?: string }) => {
    if (typeof auctionId !== "string" || !auctionId) return;
    leaveAuctionRoom(socket, auctionId);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

httpServer.listen(port, () => {
  console.log(`Haven backend listening on http://localhost:${port}`);
});
