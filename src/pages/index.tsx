import GradeForm from "@/components/grade-form";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <GradeForm />
      <p>
        Revisá tu curriculum basado en las guías de{" "}
        <Link
          href="https://docs.silver.dev/interview-ready/getting-started/preparando-el-CV"
          className="text-indigo-400 cursor-pointer hover:text-indigo-300"
        >
          Silver.dev
        </Link>
      </p>

      <iframe
        className="rounded-lg shadow-lg mt-4 max-w-xs md:max-w-none"
        width="560"
        height="315"
        src="https://www.youtube.com/embed/D-OYA2UzlJQ?si=p3dHHaOvHH8VrN1Z"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>
    </>
  );
}
