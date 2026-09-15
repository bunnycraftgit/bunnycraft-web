import { mkdir, writeFile } from "fs/promises";
import path from "path";

// Local-disk storage adapter for uploaded custom-print files. Swap the body
// of saveUploadedFile for an S3/R2 client later — callers only depend on the
// returned { url } shape, not on where bytes actually land.
//
// Both the storefront and admin apps read/write the SAME physical folder
// (a customer's uploaded STL/photo needs to be visible in the admin order
// view too), but they're separate Next.js processes with different cwds.
// __dirname isn't reliable here (Turbopack/webpack can relocate a bundled
// module's runtime location), so this resolves relative to process.cwd()
// instead — every app lives at the same depth (apps/<name>), two levels
// under the monorepo root, so "../../uploads" is consistent across all of
// them. Override UPLOAD_DIR with an absolute path if deploying with a
// different shared volume.
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "../../uploads");

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
