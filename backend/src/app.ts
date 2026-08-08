import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { authRouter } from "./routes/auth.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { productRouter } from "./routes/product.routes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env["FRONTEND_ORIGIN"] ?? "http://localhost:5173",
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json());

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/products", productRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use(
    (
      error: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    },
  );

  return app;
}
