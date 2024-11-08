import Score from "@/components/score";
import type { FormState } from "@/types";
import { useMutationState } from "@tanstack/react-query";
import Link from "next/link";

function isFormState(data?: unknown): data is FormState {
  return !!data && typeof (data as FormState).grade === "string";
}

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
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            points="67 24 36 33.5 5 43 5 24 5 5 36 14.5 67 24"
          />
          <line
            x1="5"
            x2="5"
            y1="5"
            y2="67"
            fill="none"
            stroke="#111"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
        </g>
      </g>
    </svg>
  );
}

export default function Review() {
  const mutations = useMutationState({
    filters: { mutationKey: ["resume-check"] },
    select: (mutation) => [mutation.state.data, mutation.state.variables],
  });
  const [data, variables] = mutations[mutations.length - 1] || [];

  return (
    <div className="mt-6 animate-fly-in container mx-auto px-4">
      {isFormState(data) ? (
        <>
          <h2 className="text-2xl mb-4">Your resume score: {data?.grade}</h2>
          <Score letter={data.grade} />
          {data?.red_flags.length > 0 ? (
            <>
              <h3 className="text-xl mt-4 mb-2">
                <Flag color="#d22f27" />
                Red flags
              </h3>
              <ul className="pl-6">
                {data?.red_flags.map((flag) => (
                  <li className="list-disc" key={flag}>
                    {flag}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {data?.yellow_flags.length > 0 ? (
            <>
              <h3 className="text-xl mt-4 mb-2 flex gap-2 items-center">
                <Flag color="#bada55" /> Yellow flags
              </h3>
              <ul className="pl-6">
                {data?.yellow_flags.map((flag) => (
                  <li className="list-disc" key={flag}>
                    {flag}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </>
      ) : (
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
      )}

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
  );
}
