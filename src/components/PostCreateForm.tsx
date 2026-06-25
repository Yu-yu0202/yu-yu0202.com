import {
	Box,
	Button,
	Card,
	Checkbox,
	Flex,
	Heading,
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

export const PostCreateForm = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [body, setBody] = useState("");
	const [colorMode, setColorMode] = useState<"light" | "dark">("light");

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
			isPublished: formData.get("isPublished") === "on",
			metaTitle: (formData.get("metaTitle") as string) || null,
			metaDescription: (formData.get("metaDescription") as string) || null,
			ogImage: (formData.get("ogImage") as string) || null,
			noindex: formData.get("noindex") === "on",
		};

		try {
			const response = await fetch("/api/blog/posts", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (response.ok) {
				toast.success("記事を作成しました！");
				await new Promise((resolve) => setTimeout(resolve, 300));
				window.location.href = "/admin/posts";
				return;
			}

			const errorData: { error: ApiError; value?: string } =
				await response.json();
			const messageTemplate =
				ErrorMessage[errorData.error] || "エラーが発生しました";

			const message = errorData.value
				? replacePlaceholder(messageTemplate, errorData.value)
				: messageTemplate;

			toast.error(message);
		} catch (error) {
			console.error("Create post error:", error);
			toast.error("通信中にエラーが発生しました。");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card size="4">
			<Heading as="h1" size="6" trim="start" mb="5">
				新規記事作成
			</Heading>

			<form onSubmit={handleSubmit}>
				<Flex direction="column" gap="4">
					<label>
						<Text as="div" size="2" mb="1" weight="bold">
							タイトル <span style={{ color: "var(--red-9)" }}>*</span>
						</Text>
						<TextField.Root
							name="title"
							placeholder="記事のタイトル"
							required
							disabled={isLoading}
						/>
					</label>

					<label>
						<Text as="div" size="2" mb="1" weight="bold">
							スラッグ (URL) <span style={{ color: "var(--red-9)" }}>*</span>
						</Text>
						<TextField.Root
							name="slug"
							placeholder="example-post-slug"
							required
							disabled={isLoading}
						/>
					</label>

					<label>
						<Text as="div" size="2" mb="1" weight="bold">
							本文 (Markdown) <span style={{ color: "var(--red-9)" }}>*</span>
						</Text>
						<Box data-color-mode={colorMode}>
							<MDEditor
								value={body}
								onChange={(val) => setBody(val || "")}
								previewOptions={{
									rehypePlugins: [[rehypeSanitize]],
								}}
								height={500}
								style={{ fontSize: "16px" }}
							/>
						</Box>
					</label>

					<Heading as="h2" size="4" mt="4">
						SEO / メタ情報
					</Heading>

					<label>
						<Text as="div" size="2" mb="1" weight="bold">
							メタタイトル
						</Text>
						<TextField.Root
							name="metaTitle"
							placeholder="SEO用のタイトル (省略時はタイトルを使用)"
							disabled={isLoading}
						/>
					</label>

					<label>
						<Text as="div" size="2" mb="1" weight="bold">
							メタディスクリプション
						</Text>
						<TextArea
							name="metaDescription"
							placeholder="検索結果に表示される説明文"
							disabled={isLoading}
						/>
					</label>

					<label>
						<Text as="div" size="2" mb="1" weight="bold">
							OGP画像URL
						</Text>
						<TextField.Root
							name="ogImage"
							placeholder="https://example.com/image.png"
							disabled={isLoading}
						/>
					</label>

					<Heading as="h2" size="4" mt="4">
						公開設定
					</Heading>

					<Flex gap="4">
						<Text as="label" size="2">
							<Flex gap="2" align="center">
								<Checkbox name="isPublished" disabled={isLoading} />
								記事を公開する
							</Flex>
						</Text>

						<Text as="label" size="2">
							<Flex gap="2" align="center">
								<Checkbox name="noindex" disabled={isLoading} />
								検索エンジンから隠す (noindex)
							</Flex>
						</Text>
					</Flex>
				</Flex>

				<Flex gap="3" mt="6" justify="end">
					<Button
						type="button"
						variant="soft"
						color="gray"
						disabled={isLoading}
						onClick={() => window.history.back()}
					>
						キャンセル
					</Button>
					<Button type="submit" size="3" disabled={isLoading}>
						{isLoading ? "保存中..." : "保存する"}
					</Button>
				</Flex>
			</form>
		</Card>
	);
};
