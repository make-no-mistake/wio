import type { FastifyRequest, FastifyReply } from "fastify";
import { getS3Path } from "../helpers/storage";
import {
  findSiteByName,
  createSite,
  findSitesByOwner,
} from "../repositories/site.repository";
import {
  clearSiteFiles,
  insertSiteFile,
  getSiteFiles,
} from "../repositories/file.repository";
import { deleteS3File, writeS3File } from "../repositories/s3.repository";
import type { User } from "../repositories/user.repository";

/**
 * Looks up a site by name. If it doesn't exist, creates a new site
 * owned by the user (default for now)
 * Returns { site, isNew, error, status } where error is a string if something failed.
 */
async function findOrCreateSite(siteName: string, owner: User) {
  const existing = await findSiteByName(siteName);

  if (existing) {
    if (existing.owner_id !== owner.id) {
      return {
        site: null,
        isNew: false,
        error: "You do not own this site",
        status: 403,
      };
    }
    return { site: existing, isNew: false, error: null, status: 200 };
  }

  const created = await createSite(siteName, owner.id);
  if (!created) {
    return {
      site: null,
      isNew: false,
      error: "Failed to create site",
      status: 500,
    };
  }

  return { site: created, isNew: true, error: null, status: 201 };
}

/**
 * Removes all existing S3 objects and database rows for a site's files,
 * preparing it for a clean replace.
 */
async function cleanExistingSiteFiles(siteId: number) {
  const oldFiles = await getSiteFiles(siteId);
  for (const file of oldFiles) {
    await deleteS3File(file.s3_path);
  }
  await clearSiteFiles(siteId);
}

/**
 * Uploads each extracted archive entry to S3 and inserts a corresponding
 * site_files row.
 */
async function uploadExtractedFiles(
  siteId: number,
  siteName: string,
  extracted: Map<string, Blob>,
): Promise<void> {
  for (const [path, blob] of extracted.entries()) {
    const s3Path = getS3Path(siteName, path);
    await writeS3File(s3Path, await blob.arrayBuffer());
    await insertSiteFile(siteId, s3Path, path);
  }
}

/**
 * Handles the POST /site/push endpoint. Expects a multipart form with a "name"
 * field for the site name and a file upload containing a zip archive of the site's contents.
 * If the site doesn't exist, it will be created. If it does exist and is owned by
 * the user, its contents will be replaced with the uploaded archive.
 */
export async function push(request: FastifyRequest, reply: FastifyReply) {
  const formData = await request.file();
  if (!formData) {
    return reply.code(400).send({ error: "No file uploaded" });
  }

  const siteName = (formData.fields.name as unknown as { value: string }).value;

  const { site, isNew, error, status } = await findOrCreateSite(
    siteName,
    request.currentUser!,
  );
  if (error || !site) {
    return reply.code(status).send({ error });
  }

  if (!isNew) {
    await cleanExistingSiteFiles(site.id);
  }

  const archiveBuffer = await formData.toBuffer();
  const archive = new Bun.Archive(archiveBuffer);
  const extracted = await archive.files();

  await uploadExtractedFiles(site.id, siteName, extracted);

  return reply.code(status).send({
    site: siteName,
  });
}

/**
 * Handles the GET /api/sites endpoint. Returns a list of sites owned by the user,
 * including their name and URL.
 */
export async function listSites(request: FastifyRequest, reply: FastifyReply) {
  const user = request.currentUser!;
  const sites = await findSitesByOwner(user.id);
  const result = sites.map((s) => ({
    name: s.name,
    url: `https://${s.name}.wio.onl`,
  }));
  return reply.send(result);
}
