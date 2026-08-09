import { Router } from "express";
import { createOrderHandler, listOrdersHandler } from "../controllers/order.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const orderRouter = Router();

orderRouter.use(requireAuth);
orderRouter.get("/", listOrdersHandler);
orderRouter.post("/", createOrderHandler);
