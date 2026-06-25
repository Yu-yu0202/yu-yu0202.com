import { defineMiddleware } from "astro:middleware";
import { getLogger } from "@/logger";
import { ApiError } from "@/utils/errors";
import { verifyJWT } from "@/utils/jwt";
import { res } from "@/utils/res";

const logger = getLogger(["API", "access"]);

export const onRequest = defineMiddleware(async (ctx, next) => {
	const { pathname } = ctx.url;

	const setLocals = async () => {
		if (ctx.locals.user !== undefined) return;
		const token = ctx.cookies.get("token")?.value;
		ctx.locals.user = token ? await verifyJWT(token) : undefined;
	};

	const isAdminPath = pathname.startsWith("/admin");
	const isApiPath = pathname.startsWith("/api");

	if (isAdminPath) {
		await setLocals();

		if (pathname !== "/admin/login") {
			if (!ctx.locals.user) return ctx.redirect("/admin/login");
		} else if (ctx.locals.user) {
			return ctx.redirect("/admin/dashboard");
		}
	}

	if (isApiPath) {
		await setLocals();
	}

	if (isApiPath) {
		await setLocals();

		const startTime = Date.now();
		const method = ctx.request.method;
		const rawIp =
			ctx.request.headers.get("cf-connecting-ip") ||
			ctx.request.headers.get("x-forwarded-for") ||
			ctx.clientAddress;

		const ip = rawIp?.split(",")[0] ?? "unknown client";

		const writeLog = (status: number, error?: unknown) => {
			const duration = `${Date.now() - startTime}ms`;
			const msg = `${ip} ${method} ${pathname} ${status} - ${duration}${error ? " (CRASHED)" : ""}`;
			const meta = {
				ip,
				method,
				path: pathname,
				status,
				duration,
				...(error !== undefined && {
					error:
						error instanceof Error
							? { message: error.message, stack: error.stack }
							: error,
				}),
			};

			if (status >= 500) logger.error(msg, meta);
			else if (status >= 400) logger.warn(msg, meta);
			else logger.info(msg, meta);
		};

		try {
			const response = await next();
			writeLog(response.status);
			return response;
		} catch (err) {
			writeLog(500, err);
			return res.json({ error: ApiError.SERVER_ERROR }, 500);
		}
	}

	return next();
});
