/**
 * Extracts a clean, user-friendly error message from a Convex server error.
 *
 * Convex errors look like:
 *   "[CONVEX M(auth:signup)] [Request ID: abc123] Server Error\nUncaught Error: Email already registered\n    at handler..."
 *
 * This function pulls out just "Email already registered".
 */
export function getConvexErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const raw = err?.message || "";

  // Try to extract the message after "Uncaught Error: " or "Error: "
  const uncaughtMatch = raw.match(/Uncaught Error:\s*(.+?)(\n|$)/);
  if (uncaughtMatch) return uncaughtMatch[1].trim();

  const errorMatch = raw.match(/Error:\s*(.+?)(\n|$)/);
  if (errorMatch) return errorMatch[1].trim();

  // If no match, strip the CONVEX prefix lines and return the first meaningful line
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const firstMeaningful = lines.find(
    (l) => !l.startsWith("[CONVEX") && !l.startsWith("Called by") && !l.startsWith("at ")
  );
  if (firstMeaningful) return firstMeaningful;

  return fallback;
}
