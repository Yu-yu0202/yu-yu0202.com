import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";

const client = new SQL(import.meta.env.DATABASE_URL!);
export const db = drizzle({ client });
