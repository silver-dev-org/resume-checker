import type { NextApiRequest, NextApiResponse } from "next";
import pdfParse from "pdf-parse";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function isMultipartFormData(req: NextApiRequest) {
  return req.headers["content-type"]?.includes("multipart/form-data");
}

const sysPrompt = `
You are an expert career advisor and recruiter with extensive experience in reviewing and analyzing resumes. 
Your goal is to evaluate the content, format, and impact of resumes submitted by job seekers.
You provide constructive feedback, a grade from F to A, and specific suggestions for improvement.
Consider clarity, structure, relevant skills, accomplishments, formatting, and how well the resume targets the desired role if and only if the desired role is in the user prompt.

You will also provide two arrays in the response, red_flags and yellow_flags, red flags are very bad signs and yellow flags are a little less bad.

response will be in this format EXACTLY, replacing the text inside the # signs, 
avoid any newlines and wrap sentences with quotes like these "", the response MUST BE JSON

{
  "grade": #GRADE#,
  "red_flags": [#red_flag_1#, #red_flag_2#],
  "yellow_flags": [#yellow_flag_1#, #yellow_flag_2#],
  "review": #General review#
}

`;

function userPrompt(text: string) {
  return `
Please evaluate this resume. Provide a grade from F to A, along with feedback on how the candidate can improve. 
Take into consideration that a lot of the formatting (spaces mostly) are lost when extracting the text from the pdf file, do not take that into account

Consider the following aspects:

- Clarity and readability
- Structure and organization
- Relevant skills and accomplishments
- How well the resume aligns with the candidate's target role.

My resume:


${text}
`;
}

function cleanupPrompt(text: string) {
  return `
The following text was extracted from a PDF file and it has some formatting issues, I want you to fix them, add spaces and linebreaks where necessary
You will respond with the formatted text and nothing else, do not add any character that is not in the submitted text other than a space or a linebreak

This is the text:


${text}
`;
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
    const cleaningCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: cleanupPrompt(pdf.text) }],
    });
    const [clean] = cleaningCompletion.choices;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: sysPrompt },
        { role: "user", content: userPrompt(clean.message.content || "") },
      ],
    });

    res.status(200).json(JSON.parse(completion.choices[0].message.content));
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
