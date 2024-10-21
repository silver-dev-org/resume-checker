import type { FormState } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useEffect } from "react";

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

export default function GradeForm() {
  const router = useRouter();
  const mutation = useMutation<
    FormState,
    Error,
    | { url: string; formElement?: undefined }
    | { formElement: HTMLFormElement; url?: undefined }
  >({
    mutationKey: ["resume-check"],
    mutationFn: async ({ url, formElement }) => {
      if (url && (!url.startsWith("https") || !url.endsWith(".pdf"))) {
        throw new Error("Url must start with https and end with pdf");
      }

      if (formElement) {
        const formData = new FormData(formElement);
        return fetch(formElement.action, {
          method: "POST",
          body: formData,
        }).then((b) => b.json());
      } else {
        return fetch("/api/grade?url=" + url, {
          method: "POST",
        }).then((b) => b.json());
      }
    },
    onSuccess: () => {
      router.push("/review");
    },
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

    mutation.mutate({ formElement });
  }

  function prevent(event: FormEvent) {
    event.preventDefault();
  }

  return (
    <div className="container items-center justify-center flex flex-col">
      <form
        onSubmit={prevent}
        method="POST"
        action="/api/grade"
        encType="multipart/form-data"
        className={`w-full overflow-hidden max-w-[300px] p-8 relative border-2 rounded-lg border-gray-800 border-dashed flex items-center justify-center flex-col gap-4 ${mutation.isPending ? "animate-pulse" : ""}`}
      >
        <label htmlFor="resume">
          <span
            className={`px-4 py-2 block rounded-xl bg-indigo-800 font-bold hover:bg-indigo-600 cursor-pointer ${mutation.isPending ? "bg-gray-700 text-gray-400" : ""}`}
          >
            Buscar
          </span>
        </label>
        <span className="text-gray-300">o pegá un url</span>
        <input
          className="sr-only"
          onChange={handleFormSubmission}
          disabled={mutation.isPending}
          type="file"
          id="resume"
          name="resume"
          accept=".pdf"
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
                /** @ts-expect-error we are using css props the proper way */
                style={{ "--to": s.length }}
                className="h-8 m-0 relative overflow-hidden thinking w-max text-gray-600 text-center"
                key={s}
              >
                {s}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
