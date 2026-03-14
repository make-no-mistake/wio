import type { FastifyInstance } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { readS3File } from "../repositories/s3.repository";

const Sounds = Type.Union([
  Type.Literal("alert"),
  Type.Literal("applause"),
  Type.Literal("click"),
  Type.Literal("coin"),
  Type.Literal("crickets"),
  Type.Literal("error"),
  Type.Literal("message"),
  Type.Literal("notification"),
  Type.Literal("pop"),
  Type.Literal("success"),
  Type.Literal("switch"),
]);

const PlaysoundBody = Type.Object({
  sound: Sounds,
});

const SoundParams = Type.Object({
  sound: Sounds,
});

export async function playSoundRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  app.get(
    "/:sound",
    { schema: { params: SoundParams } },
    async (request, reply) => {
      const { sound } = request.params;
      try {
        const { bytes, mimetype } = await readS3File(`sounds/${sound}.mp3`);
        return reply.header("Content-Type", mimetype).send(bytes);
      } catch (error) {
        request.log.warn({ error, sound }, "Sound not found");
        return reply.status(404).send({ error: "Sound not found" });
      }
    },
  );

  app.post("/", { schema: { body: PlaysoundBody } }, async (request, reply) => {
    const { sound } = request.body;
    const siteId = request.site?.id;

    if (!siteId) return reply.status(400).send({ error: "Missing siteId" });

    const soundPath = `/playsound/${encodeURIComponent(sound)}`;
    fastify.io.to(`site:${siteId}`).emit("play-sound", soundPath);
    return reply.send({ sound: soundPath });
  });
}
