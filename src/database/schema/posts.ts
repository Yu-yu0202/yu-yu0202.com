import { uuidv7PK } from "@database/utils/uuidv7.js";
import type { InferSelectModel } from "drizzle-orm";
import {
	boolean,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
	id: uuidv7PK("id"),
	slug: varchar("slug", { length: 255 }).notNull().unique(),
	title: text("title").notNull(),
	body: text("body").notNull(),
	renderedBody: text("rendered_body").notNull(),
	isPublished: boolean("is_published").default(false).notNull(),

	metaTitle: text("meta_title"),
	metaDescription: text("meta_description"),
	ogImage: text("og_image"),
	noindex: boolean("noindex").notNull().default(false),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export type Post = InferSelectModel<typeof posts>;
