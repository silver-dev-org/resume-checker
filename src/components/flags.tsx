import Markdown from "react-markdown";

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
        <Flag color={color} /> ({flags.length}) {label}
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
