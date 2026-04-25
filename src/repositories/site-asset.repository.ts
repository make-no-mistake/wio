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
  retrieveAssetBySiteIdAndName(
    siteId: number,
    name: string,
  ): Promise<SiteAsset>;
}

export class SiteAssetRepositoryImpl implements SiteAssetRepository {
  async retrieveAssetBySiteIdAndName(
    siteId: number,
    name: string,
  ): Promise<SiteAsset> {
    const asset = await getSiteFileByName(siteId, name);

    if (!asset) {
      throw new AssetNotFoundError(
        `Asset ${name} not found for site ${siteId}`,
      );
    }

    return await readS3File(asset.s3_path);
  }
}
