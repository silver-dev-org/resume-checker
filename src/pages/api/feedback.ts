import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import fs from "node:fs";
import formidable from "formidable";
import FeedbackEmail from "@/components/feedback-email";

const resend = new Resend(process.env.RESEND_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== "POST") {
      res.status(404).send({ message: "Not Found" });
      return;
    }

    const form = formidable({});
    const [fields, files] = await form.parse(req);

    const red_flags = fields.red_flags?.[0]
      ? JSON.parse(fields.red_flags[0])
      : [];
    const yellow_flags = fields.yellow_flags?.[0]
      ? JSON.parse(fields.yellow_flags[0])
      : [];
    const grade = fields.grade?.[0] ? fields.grade[0] : "";
    const url = fields.url?.[0] ? fields.url[0] : "";
    const description = fields.description?.[0] ? fields.description[0] : "";
    const resume = files.resume?.[0] ? files.resume[0] : undefined;

    let attachment;
    if (resume) {
      attachment = {
        content: fs.readFileSync(resume.filepath).toString("base64"),
        filename: "resume.pdf",
      };
    } else if (url && url.startsWith("http")) {
      attachment = { path: url, filename: "resume.pdf" };
    }

    const { error } = await resend.emails.send({
      from: "Resume Checker <jenaro@resume.silver.dev>",
      to: ["jen.calvineo@gmail.com", "info@silver.dev"],
      subject: "Resume Checker",
      react: FeedbackEmail({ yellow_flags, red_flags, grade, description }),
      attachments: attachment ? [attachment] : undefined,
    });

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Tuvimos un error inesperado al enviar tu mail, probá denuevo",
    });
  }
}

export const config = {
  maxDuration: 30,
  api: {
    bodyParser: false,
  },
};
