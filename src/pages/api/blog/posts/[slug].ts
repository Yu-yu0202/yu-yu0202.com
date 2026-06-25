import { db } from "@database";
import { posts } from "@database/schema";
import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";
import { ApiError } from "@/utils/errors";
import { res } from "@/utils/res";

export const prerender = false;

export const GET: APIRoute = async (ctx) => {
	const { slug } = ctx.params;
	if (!slug) return res.json({ error: ApiError.BAD_REQUEST }, 400);

	const [post] = await db
		.select()
		.from(posts)
		.where(and(eq(posts.slug, slug), eq(posts.isPublished, true)));
	if (!post) return res.json({ error: ApiError.NOT_FOUND }, 404);

	return res.json(post);
};
