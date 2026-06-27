import { Button, Card, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { type ApiError, ErrorMessage } from "@/utils/errors";
import { replacePlaceholder } from "@/utils/string";

export const LoginForm = () => {
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData.entries());

		try {
			const response = await fetch("/api/session", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (response.ok) {
				toast.success("ログインしました！");
				await new Promise((resolve) => setTimeout(resolve, 400));
				window.location.href = "/admin/dashboard";
				return;
			}

			const errorData: { error: ApiError; value?: string } =
				await response.json();
			const messageTemplate = ErrorMessage[errorData.error];

			const message = errorData.value
				? replacePlaceholder(messageTemplate, errorData.value)
				: messageTemplate;

			toast.error(message);
		} catch (error) {
			console.error("Login error:", error);
			toast.error("通信中にエラーが発生しました。");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card size="4" style={{ width: "400px" }}>
			<Heading as="h1" size="6" trim="start" mb="5">
				管理画面ログイン
			</Heading>

			<form onSubmit={handleSubmit} autoComplete="on">
				<Flex direction="column" gap="3">
					<label>
						<Text as="div" size="2" mb="1" weight="bold">
							ユーザー名
						</Text>
						<TextField.Root
							name="username"
							placeholder="ユーザー名を入力"
							required
							disabled={isLoading}
							autoComplete="username"
						/>
					</label>
					<label>
						<Text as="div" size="2" mb="1" weight="bold">
							パスワード
						</Text>
						<TextField.Root
							type="password"
							name="password"
							placeholder="パスワードを入力"
							required
							disabled={isLoading}
							autoComplete="current-password"
						/>
					</label>
				</Flex>

				<Flex gap="3" mt="6" justify="end">
					<Button type="submit" size="3" disabled={isLoading}>
						{isLoading ? "ログイン中..." : "ログイン"}
					</Button>
				</Flex>
			</form>
		</Card>
	);
};
