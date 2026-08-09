import { Router } from "express";
import {
  addCartItemHandler,
  clearCartHandler,
  getCartHandler,
  removeCartItemHandler,
  updateCartItemHandler,
} from "../controllers/cart.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const cartRouter = Router();

cartRouter.use(requireAuth);
cartRouter.get("/", getCartHandler);
cartRouter.post("/items", addCartItemHandler);
cartRouter.patch("/items/:itemId", updateCartItemHandler);
cartRouter.delete("/items/:itemId", removeCartItemHandler);
cartRouter.delete("/", clearCartHandler);
