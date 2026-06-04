import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isBlobStorageConfigured } from "@/lib/blob-storage";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

/** Public endpoint for admission form — one file at a time (Vercel body size limit). */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const field = formData.get("field") as string | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    if (!field) {
      return NextResponse.json({ success: false, message: "Field name is required" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: "File exceeds 5MB limit" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, message: "Only PDF, JPG, and PNG files are allowed" }, { status: 400 });
    }

    if (!isBlobStorageConfigured()) {
      return NextResponse.json({
        success: true,
        url: `[dev:${field}:${file.name}]`,
        dev: true,
      });
    }

    const blob = await put(
      `admissions/${Date.now()}-${field}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
      file,
      { access: "public" }
    );

    return NextResponse.json({ success: true, url: blob.url });
  } catch (err) {
    console.error("Admission upload error:", err);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}
