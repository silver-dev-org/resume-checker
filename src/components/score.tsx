import { useEffect, useState } from "react";

const letterColors = {
  S: "bg-gradient-to-tr from-pink-500 to-blue-500",
  A: "bg-green-500/50",
  B: "bg-green-400/50",
  C: "bg-yellow-400/50",
} as const;

type Letter = keyof typeof letterColors;

const letterKeys = Object.keys(letterColors) as Array<Letter>;

export default function Score({ letter }: { letter?: string }) {
  const [idx, setIdx] = useState(letterKeys.length - 1);

  useEffect(() => {
    const index = letterKeys.indexOf(letter as Letter);
    if (index !== -1) {
      setIdx(index);
    }
  }, [letter]);

  return (
    <div className="overflow-hidden duration-300 w-16 h-16 md:w-20 md:h-20 rounded-lg grid place-items-center border-2 border-black/60 dark:border-white/60">
      <div
        style={{
          /** @ts-expect-error we are using css props the proper way */
          "--ty": `${idx * 4}rem`,
          "--md-ty": `${idx * 5}rem`,
        }}
        className={`transition-transform duration-1000 delay-150 flex flex-col -ml-[2px] -mt-[2px] -translate-y-[var(--ty)] md:-translate-y-[var(--md-ty)]`}
      >
        {letterKeys.map((l) => (
          <span
            key={l}
            className={`md:text-xl font-bold w-16 h-16 md:w-20 md:h-20 flex items-center justify-center ${letterColors[l]}`}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
