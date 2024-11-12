import { useEffect, useState } from "react";

const letterColors = {
  C: "bg-yellow-400/50",
  B: "bg-green-400/50",
  A: "bg-green-500/50",
  S: "bg-gradient-to-tr from-pink-500 to-blue-500",
} as const;

type Letter = keyof typeof letterColors;

const letterKeys = Object.keys(letterColors) as Array<Letter>;

export default function Score({ letter }: { letter?: string }) {
  const [currentLetter, setCurrentLetter] = useState<Letter>("C");

  useEffect(() => {
    if (!letter) return;
    let index = letterKeys.indexOf(currentLetter);
    const targetIndex = letterKeys.indexOf(letter as Letter);

    if (index < targetIndex) {
      const interval = setInterval(() => {
        if (index < targetIndex) {
          setCurrentLetter(letterKeys[++index]);
        } else {
          clearInterval(interval); // Clear interval when we reach the target
        }
      }, 300); // Adjust this delay for your animation speed

      return () => clearInterval(interval); // Cleanup interval on component unmount
    }
  }, [letter, currentLetter]);

  return (
    <div
      className={`transition-colors duration-300 w-16 h-16 md:w-20 md:h-20 rounded-lg grid place-items-center border-2 border-white/30 ${letterColors[currentLetter]}`}
    >
      <span className="md:text-xl font-bold">{currentLetter}</span>
    </div>
  );
}
