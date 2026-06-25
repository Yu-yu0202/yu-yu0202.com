import { db } from "@database";
import { posts } from "@database/schema";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { ApiError } from "@/utils/errors";
import { renderMarkdown } from "@/utils/markdown.ts";
import { res } from "@/utils/res";

export const prerender = false;

const postsUpdateSchema = createUpdateSchema(posts).omit({
	id: true,
	renderedBody: true,
	createdAt: true,
	updatedAt: true,
});

export const GET: APIRoute = async (ctx) => {
	const user = ctx.locals.user;
	if (!user) return res.json({ error: ApiError.UNAUTHORIZED }, 403);

	const { id } = ctx.params;
	if (!id) return res.json({ error: ApiError.BAD_REQUEST }, 400);

	const [post] = await db.select().from(posts).where(eq(posts.id, id));

	if (!post) return res.json({ error: ApiError.NOT_FOUND }, 404);

	return res.json(post);
};

export const PUT: APIRoute = async (ctx) => {
	const user = ctx.locals.user;
	if (!user) return res.json({ error: ApiError.UNAUTHORIZED }, 403);

	const { id } = ctx.params;
	if (!id) return res.json({ error: ApiError.BAD_REQUEST }, 400);

	let body: unknown;
	try {
		body = await ctx.request.json();
	} catch (e) {
		if (e instanceof SyntaxError) {
			return res.json({ error: ApiError.BAD_REQUEST }, 400);
		}
		throw e;
	}
	const parseResult = postsUpdateSchema.safeParse(body);

	if (!parseResult.success) {
		const error = z.flattenError(parseResult.error).fieldErrors;
		return res.json({ error: ApiError.VALIDATION_FAILED, details: error }, 400);
	}

	let renderedBody: string | undefined;
	if (parseResult.data.body) {
		renderedBody = await renderMarkdown(parseResult.data.body);
	}

	try {
		const [updatedPost] = await db
			.update(posts)
			.set({ ...parseResult.data, renderedBody })
			.where(eq(posts.id, id))
			.returning();

		if (!updatedPost) return res.json({ error: ApiError.NOT_FOUND }, 404);

		return res.json(updatedPost);
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
		throw e;
	}
};

export const DELETE: APIRoute = async (ctx) => {
	const user = ctx.locals.user;
	if (!user) return res.json({ error: ApiError.UNAUTHORIZED }, 403);

	const { id } = ctx.params;
	if (!id) return res.json({ error: ApiError.BAD_REQUEST }, 400);

	const [deletedPost] = await db
		.delete(posts)
		.where(eq(posts.id, id))
		.returning();
	if (!deletedPost) return res.json({ error: ApiError.NOT_FOUND }, 404);

	return res.json({ success: true, deletedId: deletedPost.id });
};
