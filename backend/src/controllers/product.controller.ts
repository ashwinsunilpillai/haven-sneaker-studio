import type { Request, Response } from "express";
import { findProductBySlug, listProducts } from "../services/product.service.js";

export async function getProducts(_req: Request, res: Response) {
  const products = await listProducts();
  res.json({ products });
}

export async function getProductBySlug(req: Request, res: Response) {
  const slug = req.params["slug"];

  if (!slug || Array.isArray(slug)) {
    res.status(400).json({ error: "Product slug is required" });
    return;
  }

  const product = await findProductBySlug(slug);

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json({ product });
}
