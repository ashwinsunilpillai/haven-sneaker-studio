import type { Request, Response } from "express";
import multer from "multer";
import { CloudinaryServiceError, uploadProductImage } from "../services/cloudinary.service.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const productImageUploadMiddleware = upload.single("image");

export async function uploadProductImageHandler(req: Request, res: Response) {
  try {
    const image = await uploadProductImage(req.file as Express.Multer.File);
    res.status(201).json({ image });
  } catch (error) {
    sendUploadError(res, error);
  }
}

export function sendUploadError(res: Response, error: unknown) {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ error: "Image must be 5 MB or smaller." });
      return;
    }

    res.status(400).json({ error: error.message });
    return;
  }

  if (error instanceof CloudinaryServiceError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Internal server error" });
}
