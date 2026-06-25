import { uuidv7PK } from "@database/utils/uuidv7.js";
import type { InferSelectModel } from "drizzle-orm";
import { pgTable, varchar } from "drizzle-orm/pg-core";

export const tags = pgTable("tags", {
	id: uuidv7PK("id"),
	name: varchar("name", { length: 50 }).notNull().unique(),
	slug: varchar("slug", { length: 50 }).notNull().unique(),
});

export type Tags = InferSelectModel<typeof tags>;
