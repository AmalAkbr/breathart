import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "orphan-cleanup",
  { hours: 12 }, // Runs every 12 hours based on backend requirements
  internal.cleanups.runOrphanCleanup,
);

export default crons;
