import Flags from "@/components/flags";
import Score from "@/components/score";
import Skeleton from "@/components/skeleton";
import { useFormState } from "@/hooks/form-context";
import type { FormState } from "@/types";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Markdown from "react-markdown";

function getUrlFromFormData(formData?: FormData) {
  if (!formData) return "";
  const resume = formData.get("resume");
  if (resume instanceof Blob) return URL.createObjectURL(resume);

  return "";
}

function getUrlFromFormUrl(url?: string) {
  if (!url) return "";
  if (url.startsWith("https")) return url;

  return url.replace("public", "");
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
    <div className="mt-6 animate-fly-in container mx-auto px-4 grid lg:grid-cols-2 gap-6">
      <object
        className="rounded-lg overflow-hidden mb-8 border-2 border-black/30 dark:border-white/30 h-full lg:min-h-[500px]"
        type="application/pdf"
        data={
          formState.formData
            ? getUrlFromFormData(formState.formData)
            : getUrlFromFormUrl(formState.url)
        }
        onLoad={(object) => {
          // free memory
          URL.revokeObjectURL((object.target as HTMLObjectElement).data);
        }}
        width="100%"
        height="100%"
      >
        <p className="flex w-full h-full text-center items-center justify-center">
          Tu browser no permite PDFs.
        </p>
      </object>
      <div>
        <h2 className="text-2xl mb-4">Your Resume Score:</h2>
        <div className="mb-8">
          <Score letter={mutation?.data?.grade} />
        </div>
        <div>
          {mutation.isPending ? <Skeleton /> : null}
          {mutation.data && mutation.data?.red_flags.length > 0 ? (
            <Flags
              flags={mutation.data.red_flags}
              color="#d22f27"
              label={`Red
                flag${mutation.data.red_flags.length > 1 ? "s" : ""}`}
            />
          ) : null}
          {mutation.data && mutation.data?.yellow_flags.length > 0 ? (
            <Flags
              flags={mutation.data.yellow_flags}
              color="#eff81a"
              label={`Yellow flag${mutation.data.yellow_flags.length > 1 ? "s" : ""}`}
            />
          ) : null}
        </div>
      </div>
      <hr className="w-full my-8 lg:col-span-2" />

      <iframe
        className="rounded-lg shadow-lg mt-4 max-w-xs md:max-w-none mx-auto lg:col-span-2"
        width="560"
        height="315"
        src="https://www.youtube.com/embed/D-OYA2UzlJQ?si=p3dHHaOvHH8VrN1Z"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>

      <p className="mt-8 text-center lg:col-span-2">
        Revisá tu LinkedIn y mucho más en{" "}
        <Link
          href="https://ready.silver.dev"
          className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
        >
          ready.silver.dev
        </Link>
      </p>
    </div>
  );
}
