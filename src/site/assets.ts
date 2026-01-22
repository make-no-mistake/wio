import { sql, s3 } from "bun";

class AssetNotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function retrieveSiteAsset(
  site: string,
  asset: string,
): Promise<{ bytes: Uint8Array; mimetype: string }> {
  const matching_assets = await sql<
    { site_id: string; filename: string }[]
  >`SELECT * FROM site_assets WHERE site_id = ${site} AND filename = ${asset}`;

  if (matching_assets.length === 0) {
    throw new AssetNotFoundError(`Asset ${asset} not found for site ${site}`);
  }

  const { site_id, filename } = matching_assets[0]!;

  const s3_path = `site_assets/${site_id}/${filename}`;
  const s3_asset = await s3.file(s3_path);

  return { bytes: await s3_asset.bytes(), mimetype: s3_asset.type };
}
