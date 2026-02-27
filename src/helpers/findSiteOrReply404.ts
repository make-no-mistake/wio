import type { FastifyReply } from "fastify";
import { findSiteByName, type Site } from "../repositories/site.repository";

export async function findSiteOrReply404(
  name: string,
  reply: FastifyReply,
): Promise<Site | null> {
  const site = await findSiteByName(name);

  if (!site) {
    reply.status(404).send({ success: false, error: "Site not found" });
    return null;
  }

  return site;
}
