import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { GenerateObjectResult, type CoreMessage } from "ai";
import PdfParse from "pdf-parse";
import { z } from "zod";
import { TYPST_TEMPLATE_URL } from "@/utils";

export type ResponseData = z.infer<typeof ResponseSchema>;

export const ResponseSchema = z.object({
  grade: z.enum(["S", "A", "B", "C"]),
  red_flags: z.array(z.string()),
  yellow_flags: z.array(z.string()),
});

const sResponse: ResponseData = {
  grade: "S",
  yellow_flags: [],
  red_flags: [],
};

const aResponse: ResponseData = {
  grade: "A",
  yellow_flags: [
    "Incluir tecnologías en el título o subtítulo del CV, lo que hace que parezca relleno.",
    "Usar un correo en Hotmail, proyecta una imagen anticuada.",
    "Incluir el domicilio completo en el CV; basta con mencionar ciudad y país si es relevante.",
    `Formato y diseño: El CV parece no seguir el estilo recomendado para Estados Unidos (como Latex o un generador similar), lo que puede restarle profesionalismo. Usá el [template de silver.dev](${TYPST_TEMPLATE_URL}).`,
  ],
  red_flags: [
    "Incluir la fecha de nacimiento, es innecesario y puede dar lugar a sesgos.",
    "Incluir detalles irrelevantes ('fluff') en la sección de Mercado Libre, lo que hace que el CV sea menos conciso y directo.",
  ],
};

const bResponse: ResponseData = {
  grade: "B",
  yellow_flags: [
    "La sección de habilidades es extensa y poco específica. Te recomiendo que la ajustes a la descripción del puesto al que te postulás, incluyendo las habilidades más relevantes y omitiendo las menos importantes o redundantes.",
    "Se menciona 'AWS' dos veces en la sección de habilidades, lo cual puede percibirse como un descuido o falta de organización.",
    "Mencionás que tus estudios universitarios están incompletos. Si bien no es un impedimento, te recomiendo que no lo hagas.",
    "El proyecto 'MercadoCat' podría detallarse un poco más. Describí las tecnologías que usaste, el impacto que tuvo y cualquier otro detalle relevante que demuestre tus habilidades y experiencia.",
  ],
  red_flags: [
    "En la sección 'Acerca de', podrías mencionar tus logros y cómo estos se alinean con las necesidades de la empresa a la que te postulás. Palabras como 'proactive', 'smart' y 'opportunities to grow' no demuestran nada, tenés que demostrar que sos el candidato que la empresa quiere.",
    "Las experiencias listadas en el CV no especifican logros concretos, métricas o resultados obtenidos en los proyectos. Sería ideal incluir métricas que reflejen impacto, como 'mejoré el tiempo de carga en un X%' o 'aumenté la eficiencia del backend en un Y%.'",
    "Inconsistencia en el uso del inglés: En la sección de 'EXPERIENCE' hay errores menores de inglés, como 'Particpated' en lugar de 'Participated'. Esto puede afectar la impresión profesional y dar una apariencia de falta de atención al detalle.",
  ],
};

const cResponse: ResponseData = {
  grade: "C",
  red_flags: [
    `Formato y diseño: El CV parece no seguir el estilo recomendado para Estados Unidos (como Latex o un generador similar), lo que puede restarle profesionalismo. Usá el [template de silver.dev](${TYPST_TEMPLATE_URL}).`,
    "Posible uso de Word u otro procesador anticuado: Si el CV fue hecho en Word o con un formato que no luce profesional, puede ser un motivo de rechazo en algunos casos.",
    "Uso de imágenes: Las empresas en Estados Unidos consideran inapropiado incluir imágenes en el CV, ya que esto no es estándar y puede generar una percepción negativa.",
    "Representación de habilidades en porcentajes: Mostrar habilidades con porcentajes es desaconsejable, ya que no comunica de manera clara el nivel real de competencia y puede dar lugar a malinterpretaciones. Se prefiere un formato que indique los conocimientos y experiencia de forma descriptiva.",
  ],
  yellow_flags: [],
};

const NON_FLAGS = `
  Ejemplos de cosas que NO son "red_flags" o "yellow_flags" y que no tenés que incluir en tu respuesta:
   - Si bien mencionás las fechas de inicio y fin de cada experiencia, no especificás si los puestos fueron a tiempo completo o parcial. Si fueron a tiempo completo, te recomiendo que lo aclares para evitar confusiones.
   - Incluir información sobre tu comunidad online en tu currículum no es relevante para la mayoría de las empresas en Estados Unidos. Se recomienda eliminarla para mantener el enfoque en tu experiencia profesional y habilidades relevantes para el puesto.
   - No hay un orden cronológico inverso en la experiencia laboral. Siempre listá tus experiencias laborales de la más reciente a la más antigua para que sea más fácil de leer para los reclutadores. (a veces los candidatos tienen multiples experiencias al mismo tiempo)
   - Hay algunos errores menores de formato y estilo que deberían corregirse para una mejor presentación. Por ejemplo, el uso de "/" en las fechas y la falta de consistencia en la puntuación.
   - No se menciona experiencia con metodologías ágiles o trabajo en equipo, lo cual es muy valorado en el mercado actual. Si tenés experiencia en estas áreas, incluilas en tu CV.
   - El correo electrónico utiliza un dominio público como Gmail. Es preferible usar un dominio propio o uno más profesional para una mejor imagen.
   - El nombre del archivo del CV no sigue un formato profesional. Se recomienda usar un formato como 'NombreApellido-CV.pdf'.
   - Tener fechas como '2019 - 2021' y '2021 - current' es redundante. Podés simplificarlo a '2019-2021' y '2021-Presente'.
`;

const GUIDE = `
  - Formato
    - Usá un template
      - Google Docs tiene una buena plantilla para empezar que es fácil de usar y está bien estéticamente
      - A las empresas en USA les gusta el CV en estilo Latex, podés usar un builder estilo Latex como Typst y usá el [template de silver.dev](${TYPST_TEMPLATE_URL}).
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
    - Escribir el currículum en español.
    - Tener errores de ortografía.
`;

export const sysPrompt = (author?: string) => `
Sos un asesor profesional y reclutador experto con amplia experiencia en revisar y analizar currículums.
Tu objetivo es evaluar el contenido, el formato y el impacto de los currículums enviados por los solicitantes de empleo.
Proporcionas retroalimentación constructiva, una calificación de C a A, y S para un currículum excepcionalmente bueno, junto con sugerencias específicas para mejorar.

No comentes de cosas de las que no estas 100% seguro, no asumas nada del currículum que no se encuentra en el mismo.
No uses tu propia opinión, usá la guía proporcionada.
No importa la ubicación de los trabajos pasados del candidato, no lo menciones como una falta o un "flag".

Seguí estas guía:
--- Comienzo de guía ---
${GUIDE}
--- Fin de guía ---

--- Aclaraciones sobre la guía ---
- Nunca digas que usar gmail está mal.
- Si el autor mencionado dentro de parentesis es "silver" no vas a mencionar nada del template (autor: ${author})
--- Fin de aclaraciones sobre la guía ---

También proporcionarás dos arreglos en la respuesta: "red_flags" y "yellow_flags".
Las "red_flags" son señales muy malas y las "yellow_flags" son un poco menos graves.
Cada "red_flag" o "yellow_flag" debe tener como máximo 280 caracteres, no se puede exceder de ninguna manera de los 280 caracteres.

${NON_FLAGS}

La respuesta será en este formato EXACTAMENTE, reemplazando el texto dentro de los #, evita cualquier salto de línea y envuelve las oraciones entre comillas como estas "",
La respuesta debe ser en español argentino/rio-platense, no quiero palabras como debes o incluyes, sino tenés o incluís.
La respuesta DEBE SER JSON:

{
  "grade": #GRADE#,
  "red_flags": [#red_flag_1#, #red_flag_2#],
  "yellow_flags": [#yellow_flag_1#, #yellow_flag_2#],
}
`;

export const userPrompt = `
Por favor, evaluá este currículum y proporciona una calificación que vaya de C a A, con S para currículums excepcionalmente buenos.
Además, ofrece comentarios detallados sobre cómo se puede mejorar el currículum.

La respuesta debe dirigirse a mí, por lo que en lugar de hablar "sobre el candidato", comunícate directamente conmigo para darme los consejos y debe ser en español argentino/rio-platense.

Seguí estas guía:
--- Comienzo de guía ---
${GUIDE}
--- Fin de guía ---

${NON_FLAGS}
`;

function createAssistantResponse(response: ResponseData): CoreMessage {
  return {
    role: "assistant",
    content: JSON.stringify(response),
  };
}

function createInput(data: Buffer): CoreMessage {
  return {
    role: "user",
    content: [
      {
        type: "text",
        text: userPrompt,
      },
      {
        type: "file",
        data,
        mimeType: "application/pdf",
      },
    ],
  };
}

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || "", "base64");

function decrypt(buffer: Buffer) {
  const text = buffer.toString("utf8");
  const textParts = text.split(":");
  const iv = Buffer.from(textParts[0], "hex");
  const encryptedText = Buffer.from(textParts[1], "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
}

/* Moving the fs.readFileSync call deeper causes an error when reading files */
export function messages(
  parsed: PdfParse.Result,
  pdfBuffer: Buffer,
): CoreMessage[] {
  const msgs = [
    {
      data: fs.readFileSync(path.join(process.cwd(), "public/s_resume.pdf")),
      response: sResponse,
    },
    {
      data: fs.readFileSync(path.join(process.cwd(), "public/a_resume.pdf")),
      response: aResponse,
    },
    {
      data: fs.readFileSync(path.join(process.cwd(), "public/b_resume.pdf")),
      response: bResponse,
    },
    {
      data: fs.readFileSync(path.join(process.cwd(), "public/c_resume.pdf")),
      response: cResponse,
    },
  ];

  if (process.env.ENCRYPTION_KEY) {
    try {
      msgs.push(
        {
          data: decrypt(
            fs.readFileSync(
              path.join(process.cwd(), "public/encrypted/tomassi.pdf.enc"),
            ),
          ),
          response: {
            grade: "B",
            yellow_flags: [
              "En cada experiencia laboral, cuantificá tus logros con métricas y números para demostrar el impacto de tu trabajo. Por ejemplo, en 'Senior Web Developer', podrías mencionar cuántos usuarios usaron los sitios web que desarrollaste o cómo mejoraste la performance de la aplicación.",
              "En 'Software Developer PHP', podrías mencionar el éxito de los 65 proyectos web que lideraste. ¿Aumentaron las ventas? ¿Mejoró la satisfacción del cliente? Incluí datos concretos que demuestren tu impacto.",
            ],
            red_flags: [
              "No menciones 'over 10 years of experience'. En lugar de eso, cuantificá tus logros con métricas y resultados concretos.",
              "Quitá la sección 'LANGUAGE'. Si la empresa requiere un nivel de inglés específico, lo va a mencionar en la descripción del trabajo. Si no lo menciona, asumí que con que puedas comunicarte está bien. En la entrevista podés mencionar tu nivel de inglés si te sentís cómodo.",
              "No incluyas un resumen genérico como el que tenés en 'ABOUT ME'. Tenés que adaptar esta sección a cada empresa a la que te postules, respondiendo a la pregunta de por qué deberían contratarte.",
              "Quitá la sección 'SKILLS'. En lugar de eso, incorporá tus habilidades dentro de la descripción de tus experiencias laborales, con ejemplos concretos de cómo las usaste y los resultados que obtuviste. Mencionar las tecnologías sin contexto no aporta valor a tu CV.",
              "Tus habilidades y experiencias no son muy consistentes, sos Back End Developer, Full Stack o Front End? Mencionás SEO, graphical interfaces y el puesto de trabajo dice Back End, tratá de adaptar el CV al puesto que estás buscando.",
            ],
          },
        },
        {
          data: decrypt(
            fs.readFileSync(
              path.join(process.cwd(), "public/encrypted/gimenez.pdf.enc"),
            ),
          ),
          response: {
            grade: "C",
            yellow_flags: [
              "Las habilidades están listadas sin mayor detalle. En lugar de simplemente enumerarlas, describí cómo las has aplicado en proyectos concretos y cuantificá los resultados siempre que sea posible.",
              "No hay información sobre proyectos personales, lo que podría ser una buena oportunidad para demostrar tus habilidades y pasión por la tecnología. Si tenés proyectos, incluilos.",
              "La experiencia laboral no está descrita con suficiente detalle. Incluí más información sobre tus responsabilidades y logros cuantificables.",
            ],
            red_flags: [
              "El CV está en español, lo cual es un rechazo inmediato en el mercado estadounidense.",
              `Formato y diseño: El CV no sigue las recomendaciones para empresas en Estados Unidos. Se recomienda usar un template como el de [silver.dev](${TYPST_TEMPLATE_URL}) en Typst para un estilo Latex.`,
              "El CV incluye una foto, lo cual no se recomienda para empresas en Estados Unidos.",
              "La sección 'Acerca de' no existe. Es fundamental agregar una sección que explique por qué la empresa debería contratarte, adaptándola a cada puesto al que te postules.",
              "Las habilidades como 'comunicativo' u 'organizado' no sirven en un CV.",
              "Tus habilidades y experiencias no son muy consistentes, sos Back End Developer, Full Stack o Front End? Tratá de adaptar el CV al puesto que estás buscando.",
            ],
          },
        },
        {
          data: decrypt(
            fs.readFileSync(
              path.join(process.cwd(), "public/encrypted/villalobos.pdf.enc"),
            ),
          ),
          response: {
            grade: "C",
            yellow_flags: [
              "Listar skills a mansalva no es bueno, puede ser considerado 'spray & pray'",
              "No hay información sobre proyectos personales, lo que podría ser una buena oportunidad para demostrar tus habilidades y pasión por la tecnología. Si tenés proyectos, incluilos.",
            ],
            red_flags: [
              "El CV está en español, lo cual es un rechazo inmediato en el mercado estadounidense.",
              `Formato y diseño: El CV no sigue las recomendaciones para empresas en Estados Unidos. Se recomienda usar un template como el de [silver.dev](${TYPST_TEMPLATE_URL}) en Typst para un estilo Latex.`,
              "No cuantificás tus logros. En lugar de decir 'mejorar y extender el sistema', podrías decir 'Mejoré la eficiencia del sistema en un 15% al reducir el tiempo de carga en un 20%'. Siempre que puedas, incluí números y datos concretos para respaldar tus afirmaciones.",
              "El currículum tiene dos páginas. Para empresas en Estados Unidos, lo ideal es que el CV tenga una sola página, a menos que tengas una trayectoria muy extensa y destacada. Tenés que sintetizar la información de forma concisa y relevante.",
              "Hay errores de tipeo o gramaticales ('consoulting', 'él envió'). Antes de enviar tu CV, revisalo cuidadosamente o usá un corrector gramatical como Grammarly. Errores como estos dan una mala impresión y pueden ser motivo de rechazo automático en muchos casos.",
            ],
          },
        },
        {
          data: decrypt(
            fs.readFileSync(
              path.join(process.cwd(), "public/encrypted/boga.pdf.enc"),
            ),
          ),
          response: {
            grade: "A",
            yellow_flags: [
              "Tu CV usa varias fuentes distintas, serif y sans-serif, procura usar una sola.",
              "En la sección de experiencia, podrías cuantificar tus logros con mayor precisión. Por ejemplo, en lugar de decir 'contribuyó al crecimiento significativo de la empresa', podrías decir 'aumenté la base de clientes en un X%' o 'implementé una nueva estrategia que generó un aumento del Y% en las ventas'.",
            ],
            red_flags: [],
          },
        },
        {
          data: decrypt(
            fs.readFileSync(
              path.join(process.cwd(), "public/encrypted/oviedo.pdf.enc"),
            ),
          ),
          response: {
            grade: "B",
            yellow_flags: [
              "En la sección de idiomas, la descripción de tu nivel de inglés es redundante. Podés simplificarlo a 'Upper-intermediate English' y mencionar que te comunicás con fluidez en entornos profesionales y técnicos.",
            ],
            red_flags: [
              "Incluir 'Product managment fundamentals' como certificación es poco usual, podrías omitirlo o detallarlo más en la sección de experiencia si es relevante para el puesto al que te postulás.",
              `Formato y diseño: El CV no sigue las recomendaciones para empresas en Estados Unidos. Se recomienda usar un template como el de [silver.dev](${TYPST_TEMPLATE_URL}) en Typst para un estilo Latex.`,
              "La lista de certificaciones es extensa y poco específica. Enfocate en las más relevantes para el puesto al que te postulás y organizalas de manera más visual, por ejemplo, agrupándolas por categorías o áreas de especialización.",
              "Hay errores de tipeo o gramaticales ('deliveri', 'Certificacions'). Antes de enviar tu CV, revisalo cuidadosamente o usá un corrector gramatical como Grammarly. Errores como estos dan una mala impresión y pueden ser motivo de rechazo automático en muchos casos.",
            ],
          },
        },
        {
          data: decrypt(
            fs.readFileSync(
              path.join(process.cwd(), "public/encrypted/porracin.pdf.enc"),
            ),
          ),
          response: {
            grade: "B",
            yellow_flags: [
              "La sección 'Logros' no está cuantificada. En lugar de simplemente mencionar los logros, cuantificá el impacto de los mismos con datos y números para que sean más convincentes. Por ejemplo, en lugar de decir 'Ahorro drástico en los tiempos de desarrollo', podrías decir 'Reducción del 30% en los tiempos de desarrollo'.",
              "Si bien mencionás responsabilidades en cada puesto, es importante destacar los logros y resultados obtenidos en cada uno. Incluí ejemplos cuantificables de cómo tus acciones generaron un impacto positivo en la empresa.",
            ],
            red_flags: [
              `Formato y diseño: El CV no sigue las recomendaciones para empresas en Estados Unidos. Se recomienda usar un template como el de [silver.dev](${TYPST_TEMPLATE_URL}) en Typst para un estilo Latex.`,
            ],
          },
        },
        {
          data: decrypt(
            fs.readFileSync(
              path.join(process.cwd(), "public/encrypted/montrull.pdf.enc"),
            ),
          ),
          response: {
            grade: "C",
            yellow_flags: [
              "Si bien la experiencia en logística puede ser relevante para algunos puestos, asegurate de destacar las habilidades transferibles que adquiriste en esos roles y cómo se aplican al puesto al que te postulás.",
            ],
            red_flags: [
              "El currículum está escrito en español, lo que no es recomendable para empresas en Estados Unidos. Siempre escribí tu currículum en inglés.",
              "Incluir la fecha de nacimiento en el currículum no es relevante para las empresas en Estados Unidos y puede ser motivo de discriminación. Te recomiendo eliminarla.",
              `El diseño del currículum es poco profesional y no sigue las convenciones de un currículum moderno para empresas en Estados Unidos. Te recomiendo usar un template como el de [silver.dev](${TYPST_TEMPLATE_URL}).`,
              "La sección 'Sobre mí' es genérica y no destaca tus logros o habilidades de forma convincente. Tenés que responder a la pregunta de '¿Por qué esta empresa debería contratarme?' de manera implícita o explícita.",
              "Las descripciones de tus experiencias laborales son demasiado breves y no proporcionan suficiente detalle sobre tus responsabilidades y logros. Incluí ejemplos concretos y cuantificables siempre que sea posible. Demostrá tus logros con métricas y resultados. En lugar de simplemente listar tareas, describí el impacto que tuviste en la empresa.",
              "La sección de habilidades es demasiado genérica. En lugar de listar habilidades sueltas, enfocate en las habilidades más relevantes para el puesto al que te postulás y cómo las has aplicado en tus experiencias laborales. Agrupalas por categorías relevantes para mayor claridad.",
              "Las barras de progreso para los idiomas no son profesionales y no aportan información precisa sobre tu nivel de dominio. Te recomiendo que las elimines y describas tu nivel de dominio de cada idioma de forma clara y concisa (ej. nativo, fluido, intermedio, básico).",
            ],
          },
        },
        {
          data: decrypt(
            fs.readFileSync(
              path.join(process.cwd(), "public/encrypted/vega.pdf.enc"),
            ),
          ),
          response: {
            grade: "B",
            yellow_flags: [
              "collaborate collaborate' está repetido, revisá la ortografía y gramática del CV.",
            ],
            red_flags: [
              "Tu CV no tiene nombre.",
              "Las descripciones de tus experiencias laborales son demasiado breves y no proporcionan suficiente detalle sobre tus responsabilidades y logros. Incluí ejemplos concretos y cuantificables siempre que sea posible. Demostrá tus logros con métricas y resultados. En lugar de simplemente listar tareas, describí el impacto que tuviste en la empresa.",
            ],
          },
        },
      );
    } catch (err) {
      // log error but don't throw
      console.error(err);
    }
  }

  const trainMessages: CoreMessage[] = msgs.flatMap(({ data, response }) => [
    createInput(data),
    createAssistantResponse(response),
  ]);

  return [
    { role: "system", content: sysPrompt(parsed?.info?.Author) },
    ...trainMessages,
    createInput(pdfBuffer),
  ];
}

function hasGmail(flag: string) {
  const r = new RegExp(/gmail/i);
  return r.test(flag);
}

function hasHotmail(flag: string) {
  const r = new RegExp(/hotmail/i);
  return r.test(flag);
}

/**
 * Remove the gmail flag if hotmail is not mentioned to avoid cases like
 * "Don't use hotmail, use gmail"
 */
function removeGmailFlag(data: ResponseData) {
  const idxR = data.red_flags.findIndex((f) => !hasHotmail(f) && hasGmail(f));
  const idxY = data.yellow_flags.findIndex(
    (f) => !hasHotmail(f) && hasGmail(f),
  );

  if (idxR !== -1) {
    data.red_flags = data.red_flags.splice(idxR, 1);
  }

  if (idxY !== -1) {
    data.yellow_flags = data.yellow_flags.splice(idxY, 1);
  }
}

export function sanitizeCompletion(
  completion: GenerateObjectResult<ResponseData>,
): ResponseData {
  const data = { ...completion.object };

  removeGmailFlag(data);

  return data;
}
