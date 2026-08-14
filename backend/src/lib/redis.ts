import type { Adapter } from "socket.io-adapter";

export async function initRedisAdapter(): Promise<Adapter | null> {
  const url = process.env["REDIS_URL"] ?? process.env["REDIS_URI"] ?? "";
  if (!url) {
    console.log("REDIS_URL not set — skipping Redis adapter");
    return null;
  }

  try {
    const redis = await import("redis");
    const adapterModule = await import("@socket.io/redis-adapter");

    const pubClient = redis.createClient({ url });
    pubClient.on("error", (err: unknown) => console.error("Redis pubClient error:", err));
    await pubClient.connect();

    const subClient = pubClient.duplicate();
    subClient.on("error", (err: unknown) => console.error("Redis subClient error:", err));
    await subClient.connect();

    const adapter = adapterModule.createAdapter(pubClient, subClient);
    console.log("Redis adapter initialized");
    return adapter as unknown as Adapter;
  } catch (err) {
    console.error("Failed to initialize Redis adapter:", err);
    return null;
  }
}
