import { getCloudinary } from "../lib/cloudinary.js";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function detectImageMimeType(buffer: Buffer) {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return "image/jpeg";
  }

  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }

  if (
    buffer.subarray(0, 6).toString("ascii") === "GIF87a" ||
    buffer.subarray(0, 6).toString("ascii") === "GIF89a"
  ) {
    return "image/gif";
  }

  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  return undefined;
}

export class CloudinaryServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "CloudinaryServiceError";
  }
}

export function validateProductImageUpload(file: Express.Multer.File | undefined) {
  if (!file) {
    throw new CloudinaryServiceError(400, "Image file is required.");
  }

  const detectedMimeType = detectImageMimeType(file.buffer);
  if (!detectedMimeType) {
    throw new CloudinaryServiceError(400, "Only JPEG, PNG, WebP, and GIF images are allowed.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new CloudinaryServiceError(400, "Image must be 5 MB or smaller.");
  }
}

export async function uploadProductImage(file: Express.Multer.File) {
  validateProductImageUpload(file);

  const cloudinary = getCloudinary();
  if (!cloudinary) {
    throw new CloudinaryServiceError(503, "Cloudinary is not configured.");
  }

  const result = await cloudinary.uploader.upload(
    `data:${detectImageMimeType(file.buffer)};base64,${file.buffer.toString("base64")}`,
    {
      folder: "haven/products",
      resource_type: "image",
    },
  );

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}
