import Score from "@/components/score";
import { useFormState } from "@/hooks/form-context";
import type { FormState } from "@/types";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const loadingSentences = [
  "Analizando tu CV...",
  "Buscando áreas a mejorar...",
  "Puntuando tus habilidades...",
  "Generando sugerencias...",
];

function Flag({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 72 72"
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
    >
      <g id="color">
        <polygon
          fill={color}
          points="67 24 36 33.5 5 43 5 24 5 5 36 14.5 67 24"
        />
      </g>
      <g id="line">
        <g>
          <polygon
            fill="none"
            stroke="#111"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            points="67 24 36 33.5 5 43 5 24 5 5 36 14.5 67 24"
          />
          <line
            x1="5"
            x2="5"
            y1="5"
            y2="67"
            fill="none"
            stroke="#111"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </g>
    </svg>
  );
}

function getUrlFromFormData(formData?: FormData) {
  if (!formData) return "";
  const resume = formData.get("resume");
  if (resume instanceof Blob) return URL.createObjectURL(resume);

  return "";
}

export default function Review() {
  const router = useRouter();
  const [formState] = useFormState();

  const mutation = useMutation<
    FormState,
    Error,
    | { url: string; formData?: undefined }
    | { formData: FormData; url?: undefined }
  >({
    mutationKey: ["resume-check"],
    mutationFn: async ({ url, formData }) => {
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
        throw new Error("Hubo un error inesperado, probá de nuevo");
      }

      return res.json();
    },
    onError: () => {
      router.push("/");
    },
  });

  useEffect(() => {
    if (formState.url) {
      mutation.mutate({ url: formState.url });
    } else if (formState.formData) {
      mutation.mutate({ formData: formState.formData });
    } else {
      router.push("/");
    }
    /* eslint-disable-next-line */
  }, [formState.formData, formState.url]);

  return (
    <div className="mt-6 animate-fly-in container mx-auto px-4">
      {mutation.isPending ? (
        <div className="p-8 rounded-lg bg-gray-500/10 border-2 border-black/30 dark:border-white/30 mb-8 mx-auto min-h-[300px] grid place-items-center">
          <div className="max-h-8 overflow-hidden">
            <div
              /** @ts-expect-error we are using css props the proper way */
              style={{ "--loading-steps": loadingSentences.length }}
              className="animate-loading [--loading-steps]-[12]"
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
        </div>
      ) : (
        <object
          className="rounded-lg overflow-hidden mb-8 border-2 border-black/30 dark:border-white/30"
          type="application/pdf"
          data={
            formState.formData
              ? getUrlFromFormData(formState.formData)
              : formState.url
          }
          onLoad={(object) => {
            // free memory
            URL.revokeObjectURL((object.target as HTMLObjectElement).data);
          }}
          width="100%"
          height="300"
        >
          <p className="flex w-full h-full text-center items-center justify-center">
            Tu browser no permite PDFs.
          </p>
        </object>
      )}
      <h2 className="text-2xl mb-4">Your Resume Score:</h2>
      <div className="mb-8">
        <Score letter={mutation?.data?.grade} />
      </div>
      <div className={`opacity-0 ${mutation.data ? "animate-fly-in" : ""}`}>
        {mutation.data && mutation.data?.red_flags.length > 0 ? (
          <>
            <h3 className="text-xl mt-4 mb-2 flex gap-2 items-center">
              <Flag color="#d22f27" />
              Red flags
            </h3>
            <ul className="pl-6">
              {mutation.data?.red_flags.map((flag) => (
                <li className="list-disc mb-2 last:mb-0" key={flag}>
                  {flag}
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {mutation.data && mutation.data?.yellow_flags.length > 0 ? (
          <>
            <h3 className="text-xl mt-4 mb-2 flex gap-2 items-center">
              <Flag color="#eff81a" /> Yellow flags
            </h3>
            <ul className="pl-6">
              {mutation.data?.yellow_flags.map((flag) => (
                <li className="list-disc mb-2 last:mb-0" key={flag}>
                  {flag}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <hr className="w-full my-8" />

        <iframe
          className="rounded-lg shadow-lg mt-4 max-w-xs md:max-w-none mx-auto"
          width="560"
          height="315"
          src="https://www.youtube.com/embed/D-OYA2UzlJQ?si=p3dHHaOvHH8VrN1Z"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>

        <p className="mt-8 text-center">
          Revisá tu LinkedIn y mucho más en{" "}
          <Link
            href="https://ready.silver.dev"
            className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            ready.silver.dev
          </Link>
        </p>
      </div>
    </div>
  );
}
