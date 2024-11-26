import { FormState } from "@/types";

export default function FeedbackEmail({
  yellow_flags,
  red_flags,
  grade,
  description,
}: FormState & { description: string }) {
  return (
    <div>
      <p>Description:</p>
      <p>{description}</p>
      <p>Score: {grade}</p>
      <p>Yellow flags:</p>
      <ul>
        {yellow_flags.map((flag) => (
          <li key={flag}>{flag}</li>
        ))}
      </ul>
      <p>Red flags:</p>
      <ul>
        {red_flags.map((flag) => (
          <li key={flag}>{flag}</li>
        ))}
      </ul>
    </div>
  );
}
