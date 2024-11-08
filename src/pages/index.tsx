import Link from "next/link";
import type { FormState } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";

function usePasteEvent(pasteListener: (event: ClipboardEvent) => void) {
  useEffect(() => {
    document.addEventListener("paste", pasteListener);

    return () => {
      document.removeEventListener("paste", pasteListener);
    };
  }, [pasteListener]);
}

const loadingSentences = [
  "Analizando tu CV...",
  "Buscando áreas a mejorar...",
  "Puntuando tus habilidades...",
  "Generando sugerencias...",
];

export default function Home() {
  const router = useRouter();

  const mutation = useMutation<
    FormState,
    Error,
    | { url: string; formData?: undefined }
    | { formData: FormData; url?: undefined }
  >({
    mutationKey: ["resume-check"],
    mutationFn: async ({ url, formData }) => {
      if (url && (!url.startsWith("https") || !url.endsWith(".pdf"))) {
        throw new Error(
          "El URL tiene que empezar con 'https' y terminar con 'pdf'",
        );
      }

      let res;

      if (formData) {
        res = await fetch("/api/grade", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/grade?url=" + url, {
          method: "POST",
        });
      }

      if (!res.ok) {
        throw new Error("Hubo un error inesperado");
      }

      return res.json();
    },
    onSuccess: () => {
      router.push("/review");
    },
  });

  const onDrop = useCallback(
    (files: File[]) => {
      const formData = new FormData();
      const [cvFile] = files;

      if (!cvFile) return;

      formData.set("resume", cvFile);
      mutation.mutate({ formData });
    },
    [mutation],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [] },
    multiple: false,
  });

  usePasteEvent(async (event: ClipboardEvent) => {
    event.preventDefault();
    const data = event.clipboardData;
    if (!data) {
      return;
    }

    const url = data.getData("text").toString();
    mutation.mutate({ url });
  });

  async function handleFormSubmission(event: ChangeEvent) {
    const formElement = event.currentTarget.parentElement;
    if (!formElement || !(formElement instanceof HTMLFormElement)) return;
    const formData = new FormData(formElement);
    const honeypot = formData.get("name");

    if (honeypot) {
      return;
    }

    mutation.mutate({ formData });
  }

  function prevent(event: FormEvent) {
    event.preventDefault();
  }

  return (
    <div
      className={`container items-center justify-start flex flex-col h-full p-8 border-4 rounded-xl ${isDragActive ? "cursor-grabbing border-gray-300 border-dashed" : "border-transparent"}`}
      {...getRootProps()}
    >
      <form
        onSubmit={prevent}
        method="POST"
        action="/api/grade"
        encType="multipart/form-data"
        className={`w-full overflow-hidden max-w-[300px] p-8 relative border-2 rounded-lg border-gray-800 border-dashed flex items-center justify-center flex-col gap-1 ${mutation.isPending ? "animate-pulse" : ""}`}
      >
        <span
          className={`px-4 py-2 block rounded-xl bg-indigo-800 font-bold hover:bg-indigo-600 cursor-pointer ${mutation.isPending ? "bg-gray-700 text-gray-400" : ""}`}
        >
          Buscar
        </span>
        <span className="text-gray-300 mt-4">o arrastrá un archivo,</span>
        <span className="text-gray-300 text-sm">o pegá un url</span>
        <input
          className="sr-only"
          onChange={handleFormSubmission}
          disabled={mutation.isPending}
          id="resume"
          name="resume"
          {...getInputProps()}
        />
        {/* honeypot */}
        <input className="sr-only" type="text" name="name" />
        {mutation.error ? (
          <div>
            <p className="text-red-500 mb-2">{mutation.error.message}</p>
          </div>
        ) : null}
      </form>

      {mutation.isPending ? (
        <div className="mt-4 max-h-8 overflow-hidden">
          <div
            /** @ts-expect-error we are using css props the proper way */
            style={{ "--loading-steps": loadingSentences.length }}
            className="animate-loading"
          >
            {loadingSentences.map((s) => (
              <p
                className="h-8 m-0 relative overflow-hidden animate-pulse w-full text-center"
                key={s}
              >
                {s}
              </p>
            ))}
          </div>
        </div>
      ) : null}
      <p className="text-center mt-6">
        Revisá tu curriculum basado en las guías de{" "}
        <Link
          href="https://docs.silver.dev/interview-ready/getting-started/preparando-el-CV"
          className="text-indigo-400 cursor-pointer hover:text-indigo-300"
        >
          Silver.dev
        </Link>
      </p>
    </div>
  );
}
