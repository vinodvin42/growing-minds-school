import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAuthenticated } from "@/lib/auth";
import { blobStorageErrorMessage, isBlobStorageConfigured } from "@/lib/blob-storage";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!isBlobStorageConfigured()) {
    return NextResponse.json(
      { success: false, message: blobStorageErrorMessage() },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
