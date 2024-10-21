import type { FormState } from "@/types";
import { useMutationState } from "@tanstack/react-query";
import Link from "next/link";

function isFormState(data?: unknown): data is FormState {
  return (
    !!data &&
    typeof (data as FormState).grade === "string" &&
    typeof (data as FormState).review === "string"
  );
}

export default function Review() {
  const [data] = useMutationState({
    filters: { mutationKey: ["resume-check"] },
    select: (mutation) => mutation.state.data,
  });

  if (!isFormState(data)) {
    return (
      <div className="max-w-md px-4 mx-auto flex items-center justify-center">
        <h2 className="text-2xl text-center">
          Hubo un error al procesar los datos, volvé{" "}
          <Link
            href="/"
            className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            atrás
          </Link>{" "}
          y probá de nuevo!
        </h2>
      </div>
    );
  }

  return (
    <div className="mt-6 animate-fly-in container mx-auto px-4">
      <h2 className="text-2xl mb-4">Score: {data?.grade}</h2>
      <h3 className="text-xl mt-4 mb-2">Review</h3>
      <p>{data?.review}</p>
      <h3 className="text-xl mt-4 mb-2">Red flags</h3>
      <ul className="pl-6">
        {data?.red_flags.map((flag) => (
          <li className="list-disc" key={flag}>
            {flag}
          </li>
        ))}
      </ul>
      <h3 className="text-xl mt-4 mb-2">Yellow flags</h3>
      <ul className="pl-6">
        {data?.yellow_flags.map((flag) => (
          <li className="list-disc" key={flag}>
            {flag}
          </li>
        ))}
      </ul>
    </div>
  );
}
