/**
 * Centralized utility to clean and format Convex error messages.
 */

export const getConvexErrorMessage = (err, fallback = "Something went wrong.") => {
  if (!err) return fallback;

  // 1. Check for ConvexError data (The cleanest path)
  // When 'throw new ConvexError("Message")' is used on server, err.data contains "Message"
  if (err.data && typeof err.data === "string") {
    return err.data;
  }

  // 2. Extract from standard error message
  const rawMessage = err.message || String(err);

  // If it's a "Server Error" wrapper, we try to find the actual Uncaught Error message inside
  if (rawMessage.includes("Server Error")) {
    // Look for the "Uncaught Error: XXX" pattern which usually follows the technical prefix
    const match = rawMessage.match(/Uncaught Error: ([^\\n]+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // 3. Fallback: Strip common technical noise if nothing else worked
  // Removes "[CONVEX M(auth:login)] [Request ID: ...] Server Error" etc.
  let cleanMessage = rawMessage
    .replace(/^Error:\s*/, "") // Remove starting "Error: "
    .replace(/\[CONVEX[^\]]*\]\s*/g, "") // Remove [CONVEX ...] tags
    .replace(/\[Request ID:[^\]]*\]\s*/g, "") // Remove Request ID
    .replace(/Server Error\s*/g, "") // Remove "Server Error"
    .replace(/at handler\s*\(.*\)/g, "") // Remove stack trace line
    .split("\n")[0] // Take only the first line
    .trim();

  return cleanMessage || fallback;
};
