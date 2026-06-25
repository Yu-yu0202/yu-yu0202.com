import { db } from "@database";
import { users } from "@database/schema";
import { verify } from "@node-rs/argon2";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { ApiError } from "@/utils/errors";
import { signJWT } from "@/utils/jwt";
import { res } from "@/utils/res";

export const prerender = false;

const loginSchema = z.object({
	username: z.string(),
	password: z.string(),
});

export const GET: APIRoute = async ({ locals }) => {
	return res.json({
		authenticated: !!locals.user,
		user: locals.user ?? null,
	});
};

export const POST: APIRoute = async ({ request: req, cookies }) => {
	const body = await req.json();

	const parseResult = loginSchema.safeParse(body);

	if (!parseResult.success) {
		const error = z.treeifyError(parseResult.error);

		return res.json({ error: ApiError.VALIDATION_FAILED, details: error }, 400);
	}

	const { username, password } = parseResult.data;

	if (cookies.has("token")) {
		return res.json({ error: ApiError.ALREADY_DONE, value: "ログイン" }, 400);
	}

	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.username, username));

	if (!user) {
		return res.json(
			{ error: ApiError.INVALID_INPUT, value: "ユーザー名またはパスワード" },
			401,
		);
	}

	const isValidPassword = await verify(user.passwordHash, password);

	if (!isValidPassword) {
		return res.json(
			{ error: ApiError.INVALID_INPUT, value: "ユーザー名またはパスワード" },
			401,
		);
	}

	const token = await signJWT(
		{
			sub: user.id,
			displayName: user.displayName,
		},
		"24h",
	);

	cookies.set("token", token, {
		path: "/",
		httpOnly: true,
		secure: import.meta.env.PROD,
		sameSite: "strict",
		maxAge: 60 * 60 * 24, // 1d
	});

	return res.json({ success: true });
};

export const DELETE: APIRoute = ({ cookies }) => {
	cookies.delete("token", {
		path: "/",
		httpOnly: true,
		secure: import.meta.env.PROD,
		sameSite: "strict",
	});
	return res.json({ success: true });
};
