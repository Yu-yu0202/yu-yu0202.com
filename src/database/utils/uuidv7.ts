import { sql } from "drizzle-orm";
import { uuid } from "drizzle-orm/pg-core";

export function uuidv7(name: string) {
	return uuid(name).default(sql`uuidv7()`);
}

export function uuidv7PK(name: string) {
	return uuidv7(name).primaryKey();
}
