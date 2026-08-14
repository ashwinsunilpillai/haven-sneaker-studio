import "dotenv/config";
import http from "node:http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { setSocketServer, joinAuctionRoom, leaveAuctionRoom } from "./lib/auction-socket.js";
import { getAuctionState, syncAuctionLifecycle } from "./services/auction.service.js";
import { initRedisAdapter } from "./lib/redis.js";

const port = Number(process.env["PORT"] ?? 4000);
const app = createApp();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env["FRONTEND_ORIGIN"],
    credentials: true,
  },
});

// Attempt to initialize Redis adapter (optional). If Redis is not configured,
// Socket.IO will continue to work in single-instance mode.
initRedisAdapter()
  .then((adapter) => {
    if (adapter) {
      // Adapter has an unknown shape at compile-time (dynamic import).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      io.adapter(adapter as any);
      console.log("Socket.IO using Redis adapter");
    }
  })
  .catch((err) => {
    console.error("Error initializing Redis adapter:", err);
  })
  .finally(() => setSocketServer(io));

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
