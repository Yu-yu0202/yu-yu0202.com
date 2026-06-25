import { toast } from "sonner";

export const LogoutButton = () => {
	const handleLogout = async () => {
		try {
			const response = await fetch("/api/session", {
				method: "DELETE",
			});

			if (response.ok) {
				toast.success("ログアウトしました！");
				await new Promise((resolve) => setTimeout(resolve, 400));
				window.location.href = "/admin/login";
			} else {
				toast.error("ログアウトに失敗しました");
			}
		} catch (error) {
			console.error("Logout error:", error);
			toast.error("エラーが発生しました");
		}
	};

	return (
		<button
			onClick={handleLogout}
			style={{
				backgroundColor: "var(--color-surface)",
				border: "1px solid var(--gray-a6)",
				padding: "var(--space-2) var(--space-4)",
				borderRadius: "var(--radius-small)",
				cursor: "pointer",
				fontSize: "var(--font-size-2)",
				color: "var(--gray-12)",
				transition: "background-color 0.2s",
			}}
		>
			ログアウト
		</button>
	);
};
