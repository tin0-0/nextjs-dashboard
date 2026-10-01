'use client'; // Error boundaries must strictly be Client Components

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the unexpected crash exception to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-full flex-col items-center justify-center gap-4 py-20">
      <h2 className="text-center text-xl font-semibold text-gray-900">
        Something went wrong!
      </h2>
      <p className="text-gray-500 max-w-md text-center text-sm">
        An unexpected structural system exception occurred while trying to process this dashboard segment view.
      </p>
      <button
        className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-500"
        onClick={() => reset()} // Attempt to recover by re-rendering the route segment layout automatically
      >
        Try again
      </button>
    </main>
  );
}
