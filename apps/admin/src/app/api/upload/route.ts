import { NextResponse } from "next/server";

import { saveUploadedFile } from "@/lib/storage";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png"]);

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File is too large (max 10MB)." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  const { url } = await saveUploadedFile(file);

  return NextResponse.json({ url, fileName: file.name, fileType: ext });
}
