import { AlertDialog, Button, Flex, Text } from "@radix-ui/themes";
import { useState } from "react";
import { toast } from "sonner";

export function PostDeleteButton({ postId }: { postId: string }) {
	const [open, setOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const response = await fetch(`/api/blog/posts/id/${postId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				toast.success("記事を削除しました。");
				window.location.reload();
			} else {
				toast.error("削除に失敗しました。");
				setOpen(false);
			}
		} catch (error) {
			console.error(error);
			toast.error("通信エラーが発生しました。");
			setOpen(false);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<AlertDialog.Root open={open} onOpenChange={setOpen}>
			<AlertDialog.Trigger>
				<Button color="red" variant="soft">
					削除
				</Button>
			</AlertDialog.Trigger>

			<AlertDialog.Content maxWidth="450px">
				<AlertDialog.Title>記事の削除</AlertDialog.Title>
				<AlertDialog.Description size="2" mb="4">
					本当にこの記事を削除しますか？
					<br />
					<Text color="red" weight="bold">
						この操作は元に戻せません。
					</Text>
				</AlertDialog.Description>

				<Flex gap="3" mt="4" justify="end">
					<AlertDialog.Cancel>
						<Button variant="soft" color="gray" disabled={isDeleting}>
							キャンセル
						</Button>
					</AlertDialog.Cancel>
					<AlertDialog.Action>
						<Button
							variant="solid"
							color="red"
							onClick={handleDelete}
							disabled={isDeleting}
						>
							{isDeleting ? "削除中..." : "削除する"}
						</Button>
					</AlertDialog.Action>
				</Flex>
			</AlertDialog.Content>
		</AlertDialog.Root>
	);
}
