import type { NextApiRequest, NextApiResponse } from "next";
import pdfParse from "pdf-parse";

function isMultipartFormData(req: NextApiRequest) {
  return req.headers["content-type"]?.includes("multipart/form-data");
}
type ResponseData =
  | {
      grade: string;
      red_flags: Array<string>;
      yellow_flags: Array<string>;
    }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  try {
    if (req.method !== "POST") {
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
        throw new Error("Either provide a file or a URL");
      }

      pdfBuffer = Buffer.from(
        await fetch(url).then((response) => response.arrayBuffer()),
      );
    }

    const pdf = await pdfParse(pdfBuffer);

    console.log(pdf.text);

    res.status(200).json({
      grade: "A",
      red_flags: [],
      yellow_flags: ["Has a weird font"],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Unexpected error " });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
