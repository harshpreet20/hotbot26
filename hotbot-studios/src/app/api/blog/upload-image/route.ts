import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const PUBLISH_SECRET = process.env.BLOG_PUBLISH_SECRET || "hotbot-blog-secret-2026";
const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "blog");

const MAX_WIDTH = 1200;
const WEBP_QUALITY = 82;
const MAX_FILE_MB = 10;

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Validate secret
  const secret = req.headers.get("x-backdrop-secret") || "";
  if (secret !== PUBLISH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Size check (before processing)
    const sizeBytes = file.size;
    if (sizeBytes > MAX_FILE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `File too large. Max ${MAX_FILE_MB}MB.` }, { status: 400 });
    }

    // Only allow image types
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // Generate filename: timestamp + sanitized original name
    const safeName = file.name
      .replace(/\.[^.]+$/, "") // remove extension
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 60);
    const filename = `${Date.now()}-${safeName}.webp`;
    const outputPath = path.join(UPLOAD_DIR, filename);

    // Process with Sharp: resize + convert to WebP + compress
    const sharpInstance = sharp(buffer);
    const metadata = await sharpInstance.metadata();

    const needsResize = (metadata.width ?? 0) > MAX_WIDTH;

    await sharpInstance
      .rotate() // auto-rotate based on EXIF orientation
      .resize(needsResize ? { width: MAX_WIDTH, withoutEnlargement: true } : undefined)
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toFile(outputPath);

    // Get output file size
    const outputStats = fs.statSync(outputPath);
    const outputMeta = await sharp(outputPath).metadata();

    const url = `/images/blog/${filename}`;

    return NextResponse.json({
      url,
      filename,
      originalName: file.name,
      width: outputMeta.width,
      height: outputMeta.height,
      originalSizeKb: Math.round(sizeBytes / 1024),
      optimizedSizeKb: Math.round(outputStats.size / 1024),
      savedPercent: Math.round((1 - outputStats.size / sizeBytes) * 100),
    });
  } catch (err) {
    console.error("Image upload error:", err);
    return NextResponse.json({ error: "Image processing failed" }, { status: 500 });
  }
}
