import { NextResponse, type NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

import { uploadDir } from "@/lib/storage";

const CONTENT_TYPES: Record<string, string> = {
  ".stl": "model/stl",
  ".obj": "text/plain",
  ".3mf": "application/octet-stream",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const filename = segments.join("/");

  if (filename.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const filePath = path.join(uploadDir(), filename);
    const data = await readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
