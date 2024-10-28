import type { NextApiRequest, NextApiResponse } from "next";
import pdfParse from "pdf-parse";
import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

function isMultipartFormData(req: NextApiRequest) {
  return req.headers["content-type"]?.includes("multipart/form-data");
}

const sysPrompt = `
  Eres un asesor profesional y reclutador experto con amplia experiencia en revisar y analizar currículums.
  Tu objetivo es evaluar el contenido, el formato y el impacto de los currículums enviados por los solicitantes de empleo.
  Proporcionas retroalimentación constructiva, una calificación de F a A, y S para un currículum excepcionalmente bueno, junto con sugerencias específicas para mejorar.

  Sigue estas guías:

  - Formato
    - Usa una plantilla
      - Google Docs tiene una plantilla inicial sólida que es fácil de usar y estética.
      - Las empresas en EE. UU. prefieren currículums de estilo Latex (Latex-style).
          - Creador de estilo Latex como https://typst.app/ - Usa plantillas como modern-pro, imprecv, modern-cv, o basic-resume.
          - Creador estilo Latex en Overleaf, por ejemplo, esta plantilla.
      - Diseños personalizados y palabras innecesarias son motivo de degradación inmediata y rechazo.
    - Debe caber en una sola página.
  - Contenido Principal
    - El currículum debe ser consistente, pero no idéntico, a tu perfil de LinkedIn.
        - Las discrepancias generan preocupaciones, y las preocupaciones llevan al rechazo.
    - Ajusta tu currículum a la empresa objetivo.
        - Revisa los perfiles existentes de la empresa y haz que coincidan. Estos son los “ganadores”.
        - Cambia los títulos de los trabajos, el contenido, el mensaje y las habilidades para que se ajusten mejor a lo que la empresa está buscando.
        - Debes contar una breve historia que destaque los puntos clave de venta de tu perfil.
    - [Recomendado] Agrega una sección de "acerca de mí" o una introducción adaptada para cada empresa.
      - Esta introducción debe responder explícita o implícitamente la pregunta "¿Por qué debería la empresa XXX contratarme?"
    - No incluyas imágenes ni fotos de perfil. Esto es tabú para empresas de EE. UU.
    - Pasa siempre tu contenido por Grammarly. Los errores tipográficos provocan el rechazo.

  - NO HACER
    - No hagas currículums personalizados ni uses herramientas desactualizadas como Word.
    - Evita estrategias de "disparar a todo" (Spray & Pray).
    - No agregues imágenes ni fotos.
    - No excedas una página.
    - No uses Hotmail como proveedor de correo.
    - No incluyas un enlace a GitHub si no tienes proyectos, contribuciones significativas o actividad.

  También proporcionarás dos arreglos en la respuesta: "red_flags" y "yellow_flags".
  Las "red_flags" son señales muy malas y las "yellow_flags" son un poco menos graves.

  La respuesta será en este formato EXACTAMENTE, reemplazando el texto dentro de los #, evita cualquier salto de línea y envuelve las oraciones entre comillas como estas "",
  la respuesta DEBE SER JSON:

  {
    "grade": #GRADE#,
    "red_flags": [#red_flag_1#, #red_flag_2#],
    "yellow_flags": [#yellow_flag_1#, #yellow_flag_2#],
    "review": #General review#
  }
`;

function userPrompt(text: string) {
  return `
Por favor, evalúa este currículum y proporciona una calificación que vaya de F a A, con S para currículums excepcionalmente buenos.
Además, ofrece comentarios detallados sobre cómo se puede mejorar el currículum. Ten en cuenta que, al extraer el texto del archivo PDF,
parte del formato (principalmente los espacios) puede perderse, así que no tomes eso en cuenta.

La respuesta debe dirigirse a mí, por lo que en lugar de hablar "sobre el candidato", comunícate directamente conmigo para darme los consejos.

Sigue estas guías:

- Formato
  - Usa una plantilla
    - Google Docs tiene una plantilla inicial sólida que es fácil de usar y estética.
    - Las empresas en EE. UU. prefieren currículums de estilo Latex (Latex-style).
        - Creador de estilo Latex como https://typst.app/ - Usa plantillas como modern-pro, imprecv, modern-cv, o basic-resume.
        - Creador estilo Latex en Overleaf, por ejemplo, esta plantilla.
    - Diseños personalizados y palabras innecesarias son motivo de degradación inmediata y rechazo.
  - Debe caber en una sola página.
- Contenido Principal
  - El currículum debe ser consistente, pero no idéntico, a tu perfil de LinkedIn.
      - Las discrepancias generan preocupaciones, y las preocupaciones llevan al rechazo.
  - Ajusta tu currículum a la empresa objetivo.
      - Revisa los perfiles existentes de la empresa y haz que coincidan. Estos son los “ganadores”.
      - Cambia los títulos de los trabajos, el contenido, el mensaje y las habilidades para que se ajusten mejor a lo que la empresa está buscando.
      - Debes contar una breve historia que destaque los puntos clave de venta de tu perfil.
  - [Recomendado] Agrega una sección de "acerca de mí" o una introducción adaptada para cada empresa.
    - Esta introducción debe responder explícita o implícitamente la pregunta "¿Por qué debería la empresa XXX contratarme?"
  - No incluyas imágenes ni fotos de perfil. Esto es tabú para empresas de EE. UU.
  - Pasa siempre tu contenido por Grammarly. Los errores tipográficos provocan el rechazo.

- NO HACER
  - No hagas currículums personalizados ni uses herramientas desactualizadas como Word.
  - Evita estrategias de "disparar a todo" (Spray & Pray).
  - No agregues imágenes ni fotos.
  - No excedas una página.
  - No uses Hotmail como proveedor de correo.
  - No incluyas un enlace a GitHub si no tienes proyectos, contribuciones significativas o actividad.


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

type ResponseData = z.infer<typeof ResponseSchema> | { error: string };

const ResponseSchema = z.object({
  grade: z.enum(["S", "A", "B", "C", "D", "E", "F"]),
  red_flags: z.array(z.string()),
  yellow_flags: z.array(z.string()),
  review: z.string(),
});

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

    const clean = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: cleanupPrompt(pdf.text),
    });

    const completion = await generateObject({
      model: openai("gpt-4o-mini"),
      system: sysPrompt,
      prompt: userPrompt(clean.text),
      schema: ResponseSchema,
    });

    if (!completion) {
      throw new Error("Couldn't complete chat request");
    }

    res.status(200).json(completion.object);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ error: err instanceof Error ? err.message : "Unexpected error" });
  }
}

export const config = {
  maxDuration: 30,
  api: {
    bodyParser: false,
  },
};
