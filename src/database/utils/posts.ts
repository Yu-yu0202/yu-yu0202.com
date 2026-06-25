import { db } from "@database";
import { posts } from "@database/schema";
import { and, eq } from "drizzle-orm";

export function getPostById(id: string, published: boolean = true) {
	return db
		.select()
		.from(posts)
		.where(
			published
				? and(eq(posts.id, id), eq(posts.isPublished, true))
				: eq(posts.id, id),
		);
}

export function getPostBySlug(slug: string, published: boolean = true) {
	return db
		.select()
		.from(posts)
		.where(
			published
				? and(eq(posts.slug, slug), eq(posts.isPublished, true))
				: eq(posts.slug, slug),
		);
}

export function getAllPosts(published: boolean = true) {
	return db
		.select()
		.from(posts)
		.where(published ? eq(posts.isPublished, true) : undefined);
}
