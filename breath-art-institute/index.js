import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "./drizzle/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Disable prefetch as it is not supported for Transaction pool mode
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

async function main() {
  const allUsers = await db.select().from(users);
  console.log(allUsers);
}

void main();
