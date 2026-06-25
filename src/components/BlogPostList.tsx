import type { Post } from "@database/schema/posts";
import { Box, Card, Flex, Heading, Skeleton, Text } from "@radix-ui/themes";
import { useEffect, useMemo, useState } from "react";

type State =
	| { status: "loading" }
	| { status: "error"; error: Error }
	| { status: "success"; posts: Post[] };

const formatDate = (value: Date | string) =>
	new Intl.DateTimeFormat("ja-JP", {
		dateStyle: "long",
	}).format(new Date(value));

const stripHtml = (html: string) => {
	const document = new DOMParser().parseFromString(html, "text/html");
	return document.body.textContent || "";
};

export const BlogPostSkeleton = () => {
	return (
		<Box className="space-y-3">
			{Array.from({ length: 5 }, (_, i) => i + 1).map((i) => (
				<Card key={`post-skeleton-${i}`} className="post-card">
					<Flex gap="3" align={"center"}>
						<Skeleton
							minWidth={"160"}
							minHeight={"96"}
							width={"160px"}
							height={"96px"}
						>
							<Box className="self-center w-40 shrink-0 grow-0 aspect-video overflow-hidden rounded-lg bg-(--gray-a3)" />
						</Skeleton>

						<Box className="flex-1">
							<Skeleton>
								<div className="h-6 w-3/4 rounded" />
							</Skeleton>

							<Skeleton>
								<div className="mt-2 h-10 w-full rounded" />
							</Skeleton>

							<Skeleton>
								<div className="mt-2 h-4 w-24 rounded" />
							</Skeleton>
						</Box>
					</Flex>
				</Card>
			))}
		</Box>
	);
};

export const BlogPostList = () => {
	const [state, setState] = useState<State>({ status: "loading" });

	useEffect(() => {
		setState({ status: "loading" });

		const fetchPosts = async (abortController: AbortController) => {
			let response: Response;

			try {
				response = await fetch("/api/blog/posts", {
					signal: abortController.signal,
				});
			} catch (e) {
				if (e instanceof DOMException && e.name === "AbortError") {
					return;
				}

				setState({
					status: "error",
					error: new Error(
						`Network error: ${e instanceof Error ? e.message : String(e)}`,
					),
				});
				return;
			}

			if (!response.ok) {
				setState({
					status: "error",
					error: new Error(`Failed to fetch posts: HTTP ${response.status}`),
				});
				return;
			}

			const data: unknown = await response.json();

			if (
				typeof data !== "object" ||
				data === null ||
				!("posts" in data) ||
				typeof data.posts !== "object" ||
				!Array.isArray(data.posts) ||
				!data.posts.every((item) => typeof item === "object" && item !== null)
			) {
				setState({
					status: "error",
					error: new Error("API returned unexpected data format"),
				});
				return;
			}

			const posts: Post[] = data.posts;
			setState({ status: "success", posts });
		};

		const abortController = new AbortController();
		void fetchPosts(abortController);

		return () => {
			abortController.abort();
		};
	}, []);

	const descriptions = useMemo(() => {
		if (state.status !== "success") return [];
		return state.posts.map(
			(post) => post.metaDescription || stripHtml(post.renderedBody),
		);
	}, [state]);

	if (state.status === "loading") {
		return <BlogPostSkeleton />;
	}

	if (state.status === "error") {
		console.error(state.error);
		return <Text>記事の取得に失敗しました。</Text>;
	}

	if (state.posts.length === 0) {
		return <Text>公開された記事がありません。</Text>;
	}

	return (
		<>
			<Flex gap="3" direction="column">
				{state.posts.map((post, idx) => (
					<Card key={post.id} className={"post-card"} asChild>
						<a href={`/blog/${post.slug}`}>
							<Flex gap="3" align={"start"}>
								<Box className="self-center w-40 shrink-0 grow-0 aspect-video overflow-hidden rounded-lg bg-(--gray-a3)">
									{post.ogImage && (
										<img
											src={post.ogImage}
											alt={post.title}
											className="size-full object-cover block"
										/>
									)}
								</Box>
								<Box>
									<Heading as="h2">{post.title}</Heading>

									<Text
										mt="0"
										className={"line-clamp-2 text-sm leading-relaxed"}
									>
										{descriptions[idx]}
									</Text>

									<Text size="2" color="gray">
										{formatDate(post.createdAt)}
									</Text>
								</Box>
							</Flex>
						</a>
					</Card>
				))}
			</Flex>

			<style>
				{`
				.post-card {
					transition:
	          transform 250ms cubic-bezier(.16, 1, .3, 1),
						box-shadow 250ms cubic-bezier(.16, 1, .3, 1),
						border-color 150ms ease;
				}
				
				.post-card:hover {
					transform: translateY(-4px);
					border-color: var(--gray-a6);
					box-shadow: var(--shadow-3);
				}
			`}
			</style>
		</>
	);
};
