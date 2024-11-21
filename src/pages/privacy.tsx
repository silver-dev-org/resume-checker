export default function Privacy() {
  return (
    <div className="container max-w-screen-md">
      <h1 className="text-xl lg:text-3xl font-bold mb-4">
        Política de Privacidad
      </h1>
      <p className="mb-6">
        Gracias por utilizar Resume Checker. Su privacidad es muy importante
        para nosotros, y estamos comprometidos a ser transparentes sobre cómo
        manejamos sus datos. A continuación, encontrará los detalles sobre
        nuestras prácticas de privacidad:
      </p>
      <ul className="list-disc pl-4">
        <li className="mb-4">
          <p className="font-bold mb-2">
            No almacenamos currículums ni información personal
          </p>
          <p>
            La herramienta Resume Checker no almacena los currículums ni ninguna
            información contenida en ellos en nuestros servidores ni en ningún
            otro lugar. Una vez que su documento es procesado, todos los datos
            se eliminan de forma inmediata.
          </p>
        </li>
        <li className="mb-4">
          <p className="font-bold mb-2">
            Uso de tecnología de inteligencia artificial
          </p>
          <p>
            Para el análisis y retroalimentación del contenido, la herramienta
            utiliza Gemini AI. Este proceso se realiza de manera segura y no se
            retiene ningún dato después del análisis.
          </p>
        </li>
        <li className="mb-4">
          <p className="font-bold mb-2">Seguridad de los datos</p>
          <p>
            Nos aseguramos de que sus datos sean procesados en un entorno
            seguro. Dado que no almacenamos información, no existe riesgo de
            acceso no autorizado ni de uso indebido de sus datos.
          </p>
        </li>
        <li className="mb-4">
          <p className="font-bold mb-2">Servicios de terceros</p>
          <p>
            La herramienta Resume Checker utiliza Gemini AI para el análisis del
            contenido y la generación de feedback. Gemini AI opera bajo sus
            propias políticas de privacidad y seguridad, diseñadas para manejar
            sus datos de manera responsable.
          </p>
        </li>
        <li className="mb-4">
          <p className="font-bold mb-2">Su consentimiento</p>
          <p>
            Al utilizar la herramienta Resume Checker, usted acepta los términos
            descritos en esta Política de Privacidad.
          </p>
        </li>
      </ul>
    </div>
  );
}
