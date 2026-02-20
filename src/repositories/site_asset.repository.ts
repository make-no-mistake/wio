import { sql, s3 } from "bun";

class AssetNotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

interface SiteAsset {
  bytes: Uint8Array;
  mimetype: string;
}

interface SiteAssetRepository {
  retrieveAssetBySiteAndName(site: string, name: string): Promise<SiteAsset>;
}

export class SiteAssetRepositoryImpl implements SiteAssetRepository {
  async retrieveAssetBySiteAndName(
    site: string,
    name: string,
  ): Promise<SiteAsset> {
    const [siteRow] = await sql<
      { id: number }[]
    >`SELECT id FROM sites WHERE name = ${site};`;

    if (!siteRow) {
      throw new AssetNotFoundError(`Site ${site} not found`);
    }

    const [asset] = await sql<
      { s3_path: string; file_name: string }[]
    >`SELECT s3_path, file_name FROM site_files WHERE site_id = ${siteRow.id} AND file_name = ${name}`;

    if (!asset) {
      throw new AssetNotFoundError(`Asset ${name} not found for site ${site}`);
    }

    const s3_asset = s3.file(asset.s3_path);

    return { bytes: await s3_asset.bytes(), mimetype: s3_asset.type };
  }
}
