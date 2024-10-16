import { ChangeEvent, FormEvent, useEffect, useState } from "react";

function usePasteEvent(pasteListener: (event: ClipboardEvent) => void) {
  useEffect(() => {
    document.addEventListener("paste", pasteListener);

    return () => {
      document.removeEventListener("paste", pasteListener);
    };
  }, [pasteListener]);
}

const loadingSentences = [
  "Analyzing your resume...",
  "Looking for areas to improve...",
  "Grading your skills...",
  "Providing suggestions...",
];

type FormState = {
  loading: boolean;
  errors: Array<string>;
  data: null | {
    grade: string;
    red_flags: Array<string>;
    yellow_flags: Array<string>;
    review: string;
  };
};
export default function GradeForm() {
  const [formState, setFormState] = useState<FormState>({
    loading: false,
    data: null,
    errors: [],
  });
  usePasteEvent(async (event: ClipboardEvent) => {
    event.preventDefault();
    setFormState((s) => ({ ...s, loading: true, errors: [] }));
    const data = event.clipboardData;
    if (!data) {
      setFormState((s) => ({
        ...s,
        errors: [...s.errors, "Couldn't get clipboard data"],
      }));
      return;
    }

    const url = data.getData("text");

    if (!url.startsWith("https") || !url.endsWith(".pdf")) {
      setFormState((s) => ({
        ...s,
        errors: [...s.errors, "URL must start with https and end with pdf"],
      }));
      return;
    }

    try {
      const res = await fetch("/api/grade?url=" + url, {
        method: "POST",
      }).then((b) => b.json());
      setFormState((s) => ({ ...s, loading: false, data: res }));
    } catch (err) {
      setFormState((s) => ({
        ...s,
        errors: [
          ...s.errors,
          err instanceof Error ? err.message : "Could not fetch",
        ],
      }));
    }
  });

  async function handleFormSubmission(event: ChangeEvent) {
    const formElement = event.currentTarget.parentElement;
    if (!formElement || !(formElement instanceof HTMLFormElement)) return;
    const formData = new FormData(formElement);
    setFormState((s) => ({ ...s, loading: true, errors: [] }));
    const honeypot = formData.get("name");

    if (honeypot) {
      return;
    }

    try {
      const res = await fetch(formElement.action, {
        method: "POST",
        body: formData,
      }).then((b) => b.json());
      setFormState((s) => ({ ...s, loading: false, data: res }));
    } catch (err) {
      setFormState((s) => ({
        ...s,
        errors: [
          ...s.errors,
          err instanceof Error ? err.message : "Could not fetch",
        ],
      }));
    }
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
        className="w-full overflow-hidden max-w-[300px] p-8 relative border-2 rounded-lg border-gray-800 border-dashed flex items-center justify-center flex-col gap-4"
      >
        <label htmlFor="resume">
          <span
            className={`px-4 py-2 block rounded-xl bg-indigo-800 font-bold hover:bg-indigo-600 cursor-pointer ${formState.loading ? "bg-gray-700 text-gray-400" : ""}`}
          >
            Browse
          </span>
        </label>
        <span className="text-gray-300">or paste a url</span>
        <input
          className="sr-only"
          onChange={handleFormSubmission}
          disabled={formState.loading}
          type="file"
          id="resume"
          name="resume"
          accept=".pdf"
        />
        {/* honeypot */}
        <input className="sr-only" type="text" name="name" />
        {formState.errors.length ? (
          <div>
            {formState.errors.map((error) => (
              <p key={error} className="text-red-500 mb-2">
                {error}
              </p>
            ))}
          </div>
        ) : null}
      </form>

      {formState.loading ? (
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
                className="h-8 m-0 relative overflow-hidden thinking w-max text-gray-600"
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
