import type { Post } from "@database/schema/posts";
import {
	Box,
	Button,
	Checkbox,
	Flex,
	Heading,
	SegmentedControl,
	Text,
	TextArea,
	TextField,
} from "@radix-ui/themes";
import MDEditor from "@uiw/react-md-editor";
import type React from "react";
import { useEffect, useState } from "react";
import rehypeSanitize from "rehype-sanitize";
import { toast } from "sonner";
import { type ApiError, ErrorMessage } from "@/utils/errors";
import { replacePlaceholder } from "@/utils/string";

interface Props {
	post: Post;
}

export const PostEditForm = ({ post }: Props) => {
	const [isLoading, setIsLoading] = useState(false);
	const [body, setBody] = useState(post.body || "");
	const [colorMode, setColorMode] = useState<"light" | "dark">("light");
	const [postStatus, setPostStatus] = useState<"draft" | "published">(
		post.isPublished ? "published" : "draft",
	);

	useEffect(() => {
		const isDark = document.documentElement.classList.contains("dark");
		setColorMode(isDark ? "dark" : "light");
	}, []);

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		const formData = new FormData(e.currentTarget);
		const data = {
			title: formData.get("title") as string,
			slug: formData.get("slug") as string,
			body: body,
			isPublished: postStatus === "published",
			metaTitle: (formData.get("metaTitle") as string) || null,
			metaDescription: (formData.get("metaDescription") as string) || null,
			ogImage: (formData.get("ogImage") as string) || null,
			noindex: formData.get("noindex") === "on",
		};

		try {
			const response = await fetch(`/api/blog/posts/id/${post.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (response.ok) {
				toast.success("記事を更新しました！");
			} else {
				const errorData: { error: ApiError; value?: string } =
					await response.json();
				const messageTemplate =
					ErrorMessage[errorData.error] || "エラーが発生しました";

				const message = errorData.value
					? replacePlaceholder(messageTemplate, errorData.value)
					: messageTemplate;

				toast.error(message);
			}
		} catch (error) {
			console.error("Update post error:", error);
			toast.error("通信中にエラーが発生しました。");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className={"flex flex-col h-full"}>
			<Flex
				align="center"
				justify="between"
				p="4"
				style={{
					borderBottom: "1px solid var(--gray-a6)",
					backgroundColor: "var(--color-surface)",
				}}
			>
				<Flex align="center" gap="4">
					<Button
						type="button"
						variant="ghost"
						onClick={() => (window.location.href = "/admin/posts")}
					>
						← 戻る
					</Button>
					<Text size="3" weight="bold">
						記事を編集
					</Text>
				</Flex>

				<Flex align="center" gap="4">
					<Button type="submit" size="2" disabled={isLoading}>
						{isLoading ? "保存中..." : "更新"}
					</Button>
				</Flex>
			</Flex>

			<Box p="4" style={{ flex: 1, overflowY: "auto" }}>
				<Flex
					gap="6"
					style={{ height: "100%", maxWidth: "1200px", margin: "0 auto" }}
				>
					<Flex direction="column" gap="4" style={{ flex: 3 }}>
						<TextField.Root
							name="title"
							placeholder="記事のタイトル"
							required
							disabled={isLoading}
							defaultValue={post.title}
							size="3"
						/>

						<Box
							style={{ flex: 1, display: "flex", flexDirection: "column" }}
							data-color-mode={colorMode}
						>
							<MDEditor
								value={body}
								onChange={(val) => setBody(val || "")}
								previewOptions={{
									rehypePlugins: [[rehypeSanitize]],
								}}
								height="100%"
								style={{ flex: 1, minHeight: "500px", fontSize: "16px" }}
							/>
						</Box>
					</Flex>

					<Flex
						direction="column"
						gap="5"
						style={{ flex: 1, minWidth: "300px" }}
					>
						<Box>
							<Heading size="3" mb="3">
								公開状態
							</Heading>

							<SegmentedControl.Root
								defaultValue={post.isPublished ? "published" : "draft"}
								disabled={isLoading}
								onValueChange={(value: "draft" | "published") =>
									setPostStatus(value)
								}
							>
								<SegmentedControl.Item value="draft">
									下書き
								</SegmentedControl.Item>

								<SegmentedControl.Item value="published">
									公開
								</SegmentedControl.Item>
							</SegmentedControl.Root>
						</Box>

						<Box>
							<Heading size="3" mb="3">
								URL スラッグ
							</Heading>
							<TextField.Root
								name="slug"
								placeholder="example-post"
								required
								disabled={isLoading}
								defaultValue={post.slug}
							/>
						</Box>

						<Box>
							<Heading size="3" mb="3">
								SEO / メタ情報
							</Heading>

							<Flex direction="column" gap="3">
								<Text as="label" size="2" mb="1" color="gray">
									メタタイトル
								</Text>
								<TextField.Root
									name="metaTitle"
									placeholder="省略時はタイトルを使用"
									disabled={isLoading}
									defaultValue={post.metaTitle || ""}
								/>

								<Text as="label" size="2" mb="1" color="gray">
									メタディスクリプション
								</Text>
								<TextArea
									name="metaDescription"
									placeholder="検索結果に表示される説明文"
									disabled={isLoading}
									defaultValue={post.metaDescription || ""}
								/>

								<Text as="label" size="2" mb="1" color="gray">
									OGP画像URL
								</Text>
								<TextField.Root
									name="ogImage"
									placeholder="https://example.com/image.png"
									disabled={isLoading}
									defaultValue={post.ogImage || ""}
								/>

								<Text as="label" size="2" mb="1" color="gray">
									インデックス設定
								</Text>
								<Text as="label" size="2">
									<Flex gap="2" align="center">
										<Checkbox
											name="noindex"
											defaultChecked={post.noindex}
											disabled={isLoading}
										/>
										検索エンジンから隠す (noindex)
									</Flex>
								</Text>
							</Flex>
						</Box>

						<Box>
							<Text size="2" color="gray">
								作成日: {new Date(post.createdAt).toLocaleString("ja-JP")}
							</Text>
						</Box>
					</Flex>
				</Flex>
			</Box>
		</form>
	);
};
