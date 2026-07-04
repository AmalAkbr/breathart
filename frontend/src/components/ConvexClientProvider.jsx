import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Use a fallback URL to prevent crashes if VITE_CONVEX_URL is not set in .env
const convexUrl = import.meta.env.VITE_CONVEX_URL || "https://dummy-url.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

export default ConvexClientProvider;
