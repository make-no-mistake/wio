import type { FastifyRequest, FastifyReply } from "fastify";
import { getS3Path } from "../helpers/storage";
import { findSiteByName, createSite } from "../repositories/site.repository";
import {
  clearSiteFiles,
  insertSiteFile,
  getSiteFiles,
} from "../repositories/file.repository";
import { deleteS3File, writeS3File } from "../repositories/s3.repository";
import { findUserByTag } from "../repositories/user.repository";

const DEFAULT_OWNER_UNIQUE_ID = "1234";

/**
 * Looks up a site by name. If it doesn't exist, creates a new site
 * owned by the user (default for now)
 * Returns { site, isNew, error } where error is a string if something failed.
 */
async function findOrCreateSite(siteName: string) {
  // FIX THIS AFTER: Recieve entire user object in request
  const owner = await findUserByTag(DEFAULT_OWNER_UNIQUE_ID);
  if (!owner) {
    return { site: null, isNew: false, error: "Owner user not found" };
  }

  const existing = await findSiteByName(siteName);
  if (existing) {
    if (existing.owner_id !== owner.id) {
      return { site: null, isNew: false, error: "You do not own this site" };
    }
    return { site: existing, isNew: false, error: null };
  }

  const created = await createSite(siteName, owner.id);
  if (!created) {
    return { site: null, isNew: false, error: "Failed to create site" };
  }

  return { site: created, isNew: true, error: null };
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

export async function push(request: FastifyRequest, reply: FastifyReply) {
  const formData = await request.file();
  if (!formData) {
    return reply.code(400).send({ error: "No file uploaded" });
  }

  const siteName = (formData.fields.name as unknown as { value: string }).value;

  const { site, isNew, error } = await findOrCreateSite(siteName);
  if (error || !site) {
    return reply.code(500).send({ error });
  }

  if (!isNew) {
    await cleanExistingSiteFiles(site.id);
  }

  const archiveBuffer = await formData.toBuffer();
  const archive = new Bun.Archive(archiveBuffer);
  const extracted = await archive.files();

  await uploadExtractedFiles(site.id, siteName, extracted);

  const status = isNew ? 201 : 200;
  return reply.code(status).send({
    site: siteName,
  });
}
