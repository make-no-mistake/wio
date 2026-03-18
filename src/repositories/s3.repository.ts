import { s3 } from "bun";

export function mimeForPath(path: string): string {
  return Bun.file(path.toLowerCase()).type;
}

export async function deleteS3File(s3Path: string): Promise<void> {
  const s3File = s3.file(s3Path);
  await s3File.delete();
}

export async function writeS3File(
  s3Path: string,
  data: ArrayBuffer,
): Promise<void> {
  const s3File = s3.file(s3Path);
  await s3File.write(data, { type: mimeForPath(s3Path) });
}

export async function readS3File(
  s3Path: string,
): Promise<{ bytes: Uint8Array; mimetype: string }> {
  const s3File = s3.file(s3Path);
  return { bytes: await s3File.bytes(), mimetype: s3File.type };
}
