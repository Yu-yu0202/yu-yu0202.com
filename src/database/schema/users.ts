import { uuidv7PK } from "@database/utils/uuidv7";
import type { InferSelectModel } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuidv7PK("id"),
	username: varchar("username", { length: 255 }).notNull(),
	displayName: varchar("display_name", { length: 100 }).notNull(),
	passwordHash: text("password_hash").notNull(),
});

export type Users = InferSelectModel<typeof users>;
