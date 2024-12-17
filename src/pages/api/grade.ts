import type { NextApiRequest, NextApiResponse } from "next";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import fs from "node:fs";
import path from "node:path";
import pdf from "pdf-parse";
import {
  messages,
  ResponseData,
  ResponseSchema,
  sanitizeCompletion,
} from "@/prompts/grade";

function isMultipartFormData(req: NextApiRequest) {
  return (
    req.method === "POST" &&
    req.headers["content-type"]?.includes("multipart/form-data")
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>,
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
      messages: messages(parsed, pdfBuffer),
      schema: ResponseSchema,
    });

    if (!completion) {
      throw new Error(
        "No se pudo completar la llamada a la inteligencia artificial",
      );
    }

    const sanitized = sanitizeCompletion(completion);

    res.status(200).json(sanitized);
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
