export default function Skeleton() {
  return (
    <div className="flex gap-2 flex-col animate-pulse">
      <div className="h-6 rounded-lg bg-gray-700/60 dark:bg-gray-700/60 w-36" />
      <div className="h-4 rounded-lg bg-gray-700/60 dark:bg-gray-700/60 w-full" />
      <div className="h-4 rounded-lg bg-gray-700/60 dark:bg-gray-700/60 w-64" />
      <div className="h-4 rounded-lg bg-gray-700/60 dark:bg-gray-700/60 w-96" />

      <div className="h-6 mt-4 rounded-lg bg-gray-700/60 dark:bg-gray-700/60 w-36" />
      <div className="h-4 rounded-lg bg-gray-700/60 dark:bg-gray-700/60 w-96" />
      <div className="h-4 rounded-lg bg-gray-700/60 dark:bg-gray-700/60 w-64" />
      <div className="h-4 rounded-lg bg-gray-700/60 dark:bg-gray-700/60 w-full" />
    </div>
  );
}
