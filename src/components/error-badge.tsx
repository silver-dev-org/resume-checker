import { useEffect, useState } from "react";

export default function ErrorBadge({ error }: { error: Error | null }) {
  const [d, set] = useState(false);

  function dismiss() {
    set(true);
  }

  useEffect(() => {
    set(false);
  }, [error]);

  return error && !d ? (
    <div className="shadow-md px-6 py-7 bg-red-600 text-white rounded-lg w-max absolute top-28 left-1/2 translate-x-[-50%] animate-error z-10">
      <p className="text-center">{error.message}</p>
      <button onClick={dismiss} className="absolute top-1 right-3 text-xl">
        &times;
      </button>
    </div>
  ) : null;
}
