import { Router } from "express";
import {
  loginHandler,
  logoutHandler,
  meHandler,
  signupHandler,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/signup", signupHandler);
authRouter.post("/login", loginHandler);
authRouter.get("/me", requireAuth, meHandler);
authRouter.post("/logout", logoutHandler);
