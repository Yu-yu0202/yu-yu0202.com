import type { AstroGlobal } from "astro";

export class res {
	public static json(
		content: Record<string | number, unknown>,
		status: number = 200,
		headers?: HeadersInit,
	) {
		return new Response(JSON.stringify(content, null, 2), {
			status,
			headers: {
				"Content-Type": "application/json",
				...headers,
			},
		});
	}

	public static status(status: number, headers?: HeadersInit) {
		return new Response(null, {
			status,
			headers,
		});
	}
}

export const intoResponse = (res: AstroGlobal["response"]) => {
	return new Response(null, res);
};
