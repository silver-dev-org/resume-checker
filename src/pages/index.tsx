import Link from "next/link";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useDropzone } from "react-dropzone";
import { useFormState } from "@/hooks/form-context";
import { useMutationState } from "@tanstack/react-query";

function usePasteEvent(pasteListener: (event: ClipboardEvent) => void) {
  useEffect(() => {
    document.addEventListener("paste", pasteListener);

    return () => {
      document.removeEventListener("paste", pasteListener);
    };
  }, [pasteListener]);
}

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState<Error | null>(null);
  const [, setFormState] = useFormState();

  const onDrop = useCallback(
    (files: File[]) => {
      const formData = new FormData();
      const [cvFile] = files;

      if (!cvFile) return;

      formData.set("resume", cvFile);
      setFormState({ formData });
      router.push("/review");
    },
    [router, setFormState],
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
    if (!url.startsWith("https") || !url.endsWith(".pdf")) {
      setError(
        new Error("El URL tiene que empezar con 'https' y terminar con 'pdf'"),
      );
      return;
    }
    setFormState({ url });
    router.push("/review");
  });

  async function handleFormSubmission(event: ChangeEvent) {
    const formElement = event.currentTarget.parentElement;
    if (!formElement || !(formElement instanceof HTMLFormElement)) return;
    const formData = new FormData(formElement);
    const honeypot = formData.get("name");

    if (honeypot) {
      return;
    }

    setFormState({ formData });
    router.push("/review");
  }

  function prevent(event: FormEvent) {
    event.preventDefault();
  }

  const mutations = useMutationState({
    filters: { mutationKey: ["resume-check"] },
    select: (mutation) => mutation.state.error,
  });

  const mutationError = mutations[mutations.length - 1];

  return (
    <div
      className={
        "container grid grid-rows-[100px_1fr_auto] w-full h-full p-8 gap-6"
      }
      {...getRootProps()}
    >
      {error || mutationError ? (
        <div className="p-6 bg-red-500/60 rounded-lg w-full self-start animate-fly-in">
          {error ? <p className="text-center">{error.message}</p> : null}
          {mutationError ? (
            <p className="text-center">{mutationError.message}</p>
          ) : null}
        </div>
      ) : (
        <span />
      )}
      <form
        onSubmit={prevent}
        method="POST"
        action="/api/grade"
        encType="multipart/form-data"
        className={`w-full overflow-hidden h-full p-8 relative border-2 rounded-lg ${isDragActive ? "cursor-grabbing border-gray-400" : "border-gray-800"}  border-dashed flex items-center justify-center flex-col gap-1`}
      >
        <span
          className={`px-10 py-2 block rounded-lg bg-indigo-800 font-bold hover:bg-indigo-600 cursor-pointer`}
        >
          Upload
        </span>
        <span className="text-gray-300 mt-4 text-center">
          Subí tu currículum para recibir feedback instantáneo
        </span>
        <input
          className="sr-only"
          onChange={handleFormSubmission}
          id="resume"
          name="resume"
          {...getInputProps()}
        />
        {/* honeypot */}
        <input className="sr-only" type="text" name="name" />
      </form>

      <p className="text-center mt-6">
        Resume checker está entrenado por recruiters e ingenieros de{" "}
        <Link
          href="https://silver.dev/"
          className="text-indigo-400 cursor-pointer hover:text-indigo-300"
        >
          Silver.dev
        </Link>{" "}
        y la{" "}
        <Link
          href="https://docs.silver.dev/interview-ready/getting-started/preparando-el-CV"
          className="text-indigo-400 cursor-pointer hover:text-indigo-300"
        >
          guía de recruiting
        </Link>
      </p>
    </div>
  );
}
