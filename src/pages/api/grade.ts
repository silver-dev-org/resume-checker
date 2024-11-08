import type { NextApiRequest, NextApiResponse } from "next";
import { generateObject } from "ai";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import fs from "node:fs";
import path from "node:path";

function isMultipartFormData(req: NextApiRequest) {
  return req.headers["content-type"]?.includes("multipart/form-data");
}

const vigonResponse = {
  object: {
    grade: "A",
    yellow_flags: [],
    red_flags: [],
  },
};

const silverResponse = {
  object: {
    grade: "D",
    yellow_flags: [
      "Incluir tecnologías en el título o subtítulo del CV, lo que hace que parezca menos profesional y más limitado.",
      "Usar un correo en Hotmail, proyecta una imagen anticuada.",
      "Incluir el domicilio completo en el CV; basta con mencionar ciudad y país si es relevante.",
    ],
    red_flags: [
      "Incluir la fecha de nacimiento, es innecesario y puede dar lugar a sesgos.",
      "Incluir detalles irrelevantes ('fluff') en la sección de Mercado Libre, lo que hace que el CV sea menos conciso y directo.",
    ],
  },
};

const badResumeResponse = {
  object: {
    grade: "F",
    red_flags: [
      "Formato y diseño: El CV parece no seguir el estilo recomendado para Estados Unidos (como Latex o un generador similar), lo que puede restarle profesionalismo. Optar por un formato como Typst o Overleaf con plantillas de estilo moderno daría una mejor impresión.",
      "Posible uso de Word u otro procesador anticuado: Si el CV fue hecho en Word o con un formato que no luce profesional, puede ser un motivo de rechazo en algunos casos.",
      "Uso de imágenes: Las empresas en Estados Unidos consideran inapropiado incluir imágenes en el CV, ya que esto no es estándar y puede generar una percepción negativa.",
      "Representación de habilidades en porcentajes: Mostrar habilidades con porcentajes es desaconsejable, ya que no comunica de manera clara el nivel real de competencia y puede dar lugar a malinterpretaciones. Se prefiere un formato que indique los conocimientos y experiencia de forma descriptiva.",
    ],
    yellow_flags: [],
  },
};

const sysPrompt = `
Sos un asesor profesional y reclutador experto con amplia experiencia en revisar y analizar currículums.
Tu objetivo es evaluar el contenido, el formato y el impacto de los currículums enviados por los solicitantes de empleo.
Proporcionas retroalimentación constructiva, una calificación de F a A, y S para un currículum excepcionalmente bueno, junto con sugerencias específicas para mejorar.

Seguí estas guía:
--- Comienzo de guía ---
- Formato
  - Usá un template
    - Google Docs tiene una buena plantilla para empezar que es fácil de usar y está bien estéticamente
    - A las empresas en USA les gusta el CV en estilo Latex, podés usar:
      - un builder estilo Latex como Typst y elegí un template como modern-pro, imprecv, modern-cv, o basic-resume, o
      - un builder Latex-style como Overleaf y elegí este template.
  - Los diseños creativos y entregados en Word le bajan la calidad a tu CV y hasta pueden llegar a ser motivos de rechazo.
  - Tiene que ser en una sola página.
- Contenido principal
  - Editá tu CV de acuerdo a la empresa que lo estés mandando:
    - Mirá perfiles de Linkedin de personas que trabajan en la empresa y copialos, estos son los “ganadores”.
    - Cambiá nombres de las posiciones, contenido, mensajes y habilidades para tratar de que se ajusten más a lo que la empresa está buscando.
    - Querés contar una historia que resalte los principales puntos fuertes de tu perfil.
  - [Recomendado] Agregá una introducción o “acerca de” que acomodes para cada empresa.
    - Esta introducción debería responder explícita o implícitamente a la pregunta de “Por qué la empresa XXX debería contratarme”.
  - No incluyas imágenes ni foto de perfil. Esto es tabú para empresas en USA.
  - Cada vez que edites el contenido pasale Grammarly, errores de tipeo en el CV son inaceptables.
- Lo que no tenés que hacer
  - Crear templates propios o usar herramientas anticuadas como Word.
  - Evitar estrategias tipo “spray & pray” (usar el mismo CV genérico, indistintamente para todas tus postulaciones).
  - Agregar imágenes y fotos.
  - Tener más de una página.
  - Usar una dirección de email @hotmail.
  - Incluir un link a GitHub que no tengas proyectos, aportes importantes o actividad.
  - No escribas el currículum en español
--- Fin de guía ---

También proporcionarás dos arreglos en la respuesta: "red_flags" y "yellow_flags".
Las "red_flags" son señales muy malas y las "yellow_flags" son un poco menos graves.

La respuesta será en este formato EXACTAMENTE, reemplazando el texto dentro de los #, evita cualquier salto de línea y envuelve las oraciones entre comillas como estas "",
la respuesta debe ser en español argentino/rio-platense,
la respuesta DEBE SER JSON:

{
  "grade": #GRADE#,
  "red_flags": [#red_flag_1#, #red_flag_2#],
  "yellow_flags": [#yellow_flag_1#, #yellow_flag_2#],
}
`;

const userPrompt = `
Por favor, evaluá este currículum y proporciona una calificación que vaya de F a A, con S para currículums excepcionalmente buenos.
Además, ofrece comentarios detallados sobre cómo se puede mejorar el currículum.

La respuesta debe dirigirse a mí, por lo que en lugar de hablar "sobre el candidato", comunícate directamente conmigo para darme los consejos y debe ser en español argentino/rio-platense.

Seguí estas guía:
--- Comienzo de guía ---
- Formato
  - Usá un template
    - Google Docs tiene una buena plantilla para empezar que es fácil de usar y está bien estéticamente
    - A las empresas en USA les gusta el CV en estilo Latex, podés usar:
      - un builder estilo Latex como Typst y elegí un template como modern-pro, imprecv, modern-cv, o basic-resume, o
      - un builder Latex-style como Overleaf y elegí este template.
  - Los diseños creativos y entregados en Word le bajan la calidad a tu CV y hasta pueden llegar a ser motivos de rechazo.
  - Tiene que ser en una sola página.
- Contenido principal
  - Editá tu CV de acuerdo a la empresa que lo estés mandando:
    - Mirá perfiles de Linkedin de personas que trabajan en la empresa y copialos, estos son los “ganadores”.
    - Cambiá nombres de las posiciones, contenido, mensajes y habilidades para tratar de que se ajusten más a lo que la empresa está buscando.
    - Querés contar una historia que resalte los principales puntos fuertes de tu perfil.
  - [Recomendado] Agregá una introducción o “acerca de” que acomodes para cada empresa.
    - Esta introducción debería responder explícita o implícitamente a la pregunta de “Por qué la empresa XXX debería contratarme”.
  - No incluyas imágenes ni foto de perfil. Esto es tabú para empresas en USA.
  - Cada vez que edites el contenido pasale Grammarly, errores de tipeo en el CV son inaceptables.
- Lo que no tenés que hacer
  - Crear templates propios o usar herramientas anticuadas como Word.
  - Evitar estrategias tipo “spray & pray” (usar el mismo CV genérico, indistintamente para todas tus postulaciones).
  - Agregar imágenes y fotos.
  - Tener más de una página.
  - Usar una dirección de email @hotmail.
  - Incluir un link a GitHub que no tengas proyectos, aportes importantes o actividad.
  - No escribas el currículum en español
--- Fin de guía ---
`;

type ResponseData = z.infer<typeof ResponseSchema> | { error: string };

const ResponseSchema = z.object({
  grade: z.enum(["S", "A", "B", "C", "D", "E", "F"]),
  red_flags: z.array(z.string()),
  yellow_flags: z.array(z.string()),
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

    const completion = await generateObject({
      model: google("gemini-1.5-pro"),
      temperature: 0.2,
      messages: [
        { role: "system", content: sysPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            {
              type: "file",
              data: fs.readFileSync(
                path.join(process.cwd(), "public/victor_vigon.pdf"),
              ),
              mimeType: "application/pdf",
            },
          ],
        },
        {
          role: "assistant",
          content: JSON.stringify(vigonResponse),
        },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            {
              type: "file",
              data: fs.readFileSync(
                path.join(process.cwd(), "public/resume_silverdev.pdf"),
              ),
              mimeType: "application/pdf",
            },
          ],
        },
        {
          role: "assistant",
          content: JSON.stringify(silverResponse),
        },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            {
              type: "file",
              data: fs.readFileSync(
                path.join(process.cwd(), "public/bad_resume.pdf"),
              ),
              mimeType: "application/pdf",
            },
          ],
        },
        {
          role: "assistant",
          content: JSON.stringify(badResumeResponse),
        },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            { type: "file", data: pdfBuffer, mimeType: "application/pdf" },
          ],
        },
      ],
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
