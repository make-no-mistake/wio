import { findSiteByName } from "./site.repository";
import { getSiteFileByName } from "./file.repository";
import { readS3File } from "./s3.repository";

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
    const siteRow = await findSiteByName(site);

    if (!siteRow) {
      throw new AssetNotFoundError(`Site ${site} not found`);
    }

    const asset = await getSiteFileByName(siteRow.id, name);

    if (!asset) {
      throw new AssetNotFoundError(`Asset ${name} not found for site ${site}`);
    }

    return await readS3File(asset.s3_path);
  }
}
