import { getAllPosts } from "@database/utils/posts.ts";
import type { APIRoute } from "astro";
import { SitemapStream, streamToPromise } from "sitemap";

export const prerender = false;

let cachedSitemap: { lastGenerated: number; xml: ArrayBufferLike } | undefined;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

const intoReadableStream = (buffer: ArrayBufferLike) =>
	new ReadableStream({
		start(controller) {
			controller.enqueue(new Uint8Array(buffer));
			controller.close();
		},
	});

export const GET: APIRoute = async () => {
	const now = Date.now();

	if (cachedSitemap && now - cachedSitemap.lastGenerated < CACHE_TTL) {
		return new Response(intoReadableStream(cachedSitemap.xml), {
			headers: {
				"Content-Type": "application/xml",
				"Cache-Control":
					"public, max-age=3600, s-maxage=3600, stale-while-revalidate=600",
			},
		});
	}

	const posts = await getAllPosts();
	const baseUrl = import.meta.env.WEBSITE_URL;
	const smStream = new SitemapStream({
		hostname: baseUrl,
		highWaterMark: 1024 * 1024, // 1 MB
	});

	smStream.write({ url: "/", changefreq: "monthly", priority: 1.0 });
	smStream.write({ url: "/contact", changefreq: "monthly", priority: 0.9 });
	smStream.write({ url: "/privacy", changefreq: "monthly", priority: 0.9 });
	smStream.write({ url: "/blog", changefreq: "hourly", priority: 0.9 });
	smStream.write({ url: "/services", changefreq: "weekly", priority: 0.9 });

	for (const post of posts) {
		smStream.write({
			url: `/posts/${post.slug}`,
			lastmod: (post.updatedAt || post.createdAt).toISOString(),
			changefreq: "weekly",
			priority: 0.8,
		});
	}

	smStream.end();

	const sitemapOutput = await streamToPromise(smStream);

	const exactBuffer = sitemapOutput.buffer.slice(
		sitemapOutput.byteOffset,
		sitemapOutput.byteOffset + sitemapOutput.byteLength,
	);

	cachedSitemap = {
		lastGenerated: now,
		xml: exactBuffer,
	};

	return new Response(intoReadableStream(exactBuffer), {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control":
				"public, max-age=3600, s-maxage=3600, stale-while-revalidate=600",
		},
	});
};
