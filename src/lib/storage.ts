import { mkdir, writeFile } from "fs/promises";
import path from "path";

// Local-disk storage adapter for uploaded custom-print files. Swap the body
// of saveUploadedFile for an S3/R2 client later — callers only depend on the
// returned { url } shape, not on where bytes actually land.
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function saveUploadedFile(
  file: File
): Promise<{ url: string; storedName: string }> {
  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name);
  const storedName = `${crypto.randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, storedName), buffer);

  return { url: `/api/files/${storedName}`, storedName };
}

export function uploadDir() {
  return UPLOAD_DIR;
}
