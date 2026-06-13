import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isStorageConfigured, storageErrorMessage } from "@/lib/storage/config";
import { writeStorageBinary } from "@/lib/storage/index";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!isStorageConfigured()) {
    return NextResponse.json({ success: false, message: storageErrorMessage() }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    const pathname = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await writeStorageBinary(pathname, buffer, file.type || "application/octet-stream");

    return NextResponse.json({ success: true, url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
