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
    </>
  );
}
