import type { NextApiRequest, NextApiResponse } from "next";
import { generateObject } from "ai";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import fs from "node:fs";
import path from "node:path";
import pdf from "pdf-parse";
import { messages } from "@/prompts/grade";

function isMultipartFormData(req: NextApiRequest) {
  return (
    req.method === "POST" &&
    req.headers["content-type"]?.includes("multipart/form-data")
  );
}

type ResponseData = z.infer<typeof ResponseSchema> | { error: string };

const ResponseSchema = z.object({
  grade: z.enum(["S", "A", "B", "C"]),
  red_flags: z.array(z.string()),
  yellow_flags: z.array(z.string()),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  try {
    if (!["POST", "GET"].includes(req.method || "")) {
      res.status(404).send({ error: "Not Found" });
      return;
    }

    let pdfBuffer: Buffer;
    if (isMultipartFormData(req)) {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      pdfBuffer = Buffer.concat(chunks);
    } else {
      const { url } = req.query;
      if (!url || typeof url !== "string") {
        throw new Error("Tenes que proveer un archivo pdf o un url");
      }

      if (url.startsWith("public")) {
        pdfBuffer = fs.readFileSync(path.join(process.cwd(), url));
        /* Set cache for a week only on the template resumes */
        res.setHeader("Content-Location", url);
        res.setHeader(
          "Cache-Control",
          "public, max-age=604800, stale-while-revalidate=604800",
        );
      } else {
        pdfBuffer = Buffer.from(
          await fetch(url).then((response) => response.arrayBuffer()),
        );
      }
    }

    const parsed = await pdf(pdfBuffer);

    const completion = await generateObject({
      model: google("gemini-1.5-pro"),
      temperature: 0,
      messages: messages(parsed, pdfBuffer, process.cwd()),
      schema: ResponseSchema,
    });

    if (!completion) {
      throw new Error(
        "No se pudo completar la llamada a la inteligencia artificial",
      );
    }

    res.status(200).json(completion.object);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ error: err instanceof Error ? err.message : "Error inesperado" });
  }
}

export const config = {
  maxDuration: 300,
  api: {
    bodyParser: false,
  },
};
