import Markdown from "react-markdown";

function Flag({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 72 72"
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
    >
      <path d="M22 36c6-4 12-3 15-1 9 4 14 4 16 3l1-1V22l-1-2c-10 1-12-2-16-4-6-3-12 0-15 1z" />
      <path
        fill={color}
        d="M22 17c3-1 9-4 15-1 4 2 6 5 16 4l1 2v15l-1 1c-2 1-7 1-16-3-3-2-9-3-15 1"
      />
      <g
        fill="none"
        stroke="#808080"
        strokeLinecap="round"
        strokeMiterlimit="10"
      >
        <path
          strokeWidth="3"
          strokeLinejoin="round"
          d="M23 17c3-1 9-4 15-1 3 2 5 5 15 4l1 2v15l-1 1c-2 1-7 1-15-3-4-2-9-3-15 1"
        />
        <path d="M19 13v47" strokeWidth="6" />
      </g>
    </svg>
  );
}

export default function Flags({
  flags,
  color,
  label,
}: {
  flags: Array<string>;
  color: string;
  label: string;
}) {
  return (
    <>
      <h3 className="text-xl mt-4 mb-2 flex gap-2 items-center">
        <Flag color={color} />
        {label} ({flags.length})
      </h3>
      <ul className="pl-6">
        {flags.map((flag) => (
          <li className="list-disc mb-2 last:mb-0" key={flag}>
            <Markdown
              components={{
                a: ({ children, href, ...props }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500 hover:text-indigo-400 dark:text-indigo-300 dark:hover-text-indigo-400 underline"
                    {...props}
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {flag}
            </Markdown>
          </li>
        ))}
      </ul>
    </>
  );
}
