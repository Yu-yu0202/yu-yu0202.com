import { db } from "@database";
import { posts } from "@database/schema";
import type { APIRoute } from "astro";
import { desc, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { getLogger } from "@/logger";
import { ApiError } from "@/utils/errors";
import { renderMarkdown } from "@/utils/markdown.ts";
import { res } from "@/utils/res";

export const prerender = false;
const logger = getLogger(["API", "posts"]);

const postsInsertSchema = createInsertSchema(posts).omit({
	id: true,
	renderedBody: true,
	createdAt: true,
	updatedAt: true,
});

export const GET: APIRoute = async (_ctx) => {
	const allPosts = await db
		.select()
		.from(posts)
		.orderBy(desc(posts.id))
		.where(eq(posts.isPublished, true));

	return res.json({ posts: allPosts });
};

export const POST: APIRoute = async (ctx) => {
	const user = ctx.locals.user;
	if (!user) return res.json({ error: ApiError.UNAUTHORIZED }, 403);

	const body = await ctx.request.json();
	const parseResult = postsInsertSchema.safeParse(body);

	if (!parseResult.success) {
		const error = z.flattenError(parseResult.error).fieldErrors;
		return res.json({ error: ApiError.VALIDATION_FAILED, details: error }, 400);
	}

	const renderedBody = await renderMarkdown(parseResult.data.body);

	try {
		const [newPost] = await db
			.insert(posts)
			.values({ ...parseResult.data, renderedBody })
			.returning();

		if (!newPost) return res.json({ error: ApiError.SERVER_ERROR }, 500);

		return res.json({ success: true, post: newPost }, 201, {
			Location: `/api/blog/posts/id/${newPost.id}`,
		});
	} catch (e) {
		let code: unknown;
		if (typeof e === "object" && e !== null) {
			if ("code" in e) {
				code = e.code;
			} else if (
				"cause" in e &&
				typeof e.cause === "object" &&
				e.cause !== null
			) {
				if ("code" in e.cause) {
					code = e.cause.code;
				} else if ("errno" in e.cause) {
					code = e.cause.errno;
				}
			}
		}

		if (code === "23505" || code === "ERR_POSTGRES_SERVER_ERROR") {
			return res.json({ error: ApiError.DUPLICATE, value: "スラッグ" }, 409);
		}

		logger.warn(
			`Failed to create post: ${e instanceof Error ? e : "Unknown Error"}`,
			{ error: e instanceof Error ? e : "Unknown Error" },
		);
		return res.json({ error: ApiError.SERVER_ERROR }, 500);
	}
};
