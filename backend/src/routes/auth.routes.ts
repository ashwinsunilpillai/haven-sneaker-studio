import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  loginHandler,
  logoutHandler,
  meHandler,
  signupHandler,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const authRouter = Router();

const authAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again later." },
});

authRouter.post("/signup", authAttemptLimiter, signupHandler);
authRouter.post("/login", authAttemptLimiter, loginHandler);
authRouter.get("/me", requireAuth, meHandler);
authRouter.post("/logout", logoutHandler);
