import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import {
  productImageUploadMiddleware,
  sendUploadError,
  uploadProductImageHandler,
} from "../controllers/upload.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const uploadRouter = Router();

function handleProductImageUpload(req: Request, res: Response, next: NextFunction) {
  productImageUploadMiddleware(req, res, (error) => {
    if (error) {
      sendUploadError(res, error);
      return;
    }

    next();
  });
}

uploadRouter.post(
  "/product-image",
  requireAuth,
  handleProductImageUpload,
  uploadProductImageHandler,
);
