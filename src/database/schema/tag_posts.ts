import { posts } from "@database/schema/posts.js";
import { tags } from "@database/schema/tags.js";
import type { InferSelectModel } from "drizzle-orm";
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";

export const tag_posts = pgTable(
	"tag_posts",
	{
		postId: uuid("post_id").references(() => posts.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
		tagId: uuid("tag_id").references(() => tags.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
	},
	(table) => [primaryKey({ columns: [table.postId, table.tagId] })],
);

export type Tag_posts = InferSelectModel<typeof tag_posts>;
