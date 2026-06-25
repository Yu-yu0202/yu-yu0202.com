import type { Post } from "@database/schema/posts";
import { Badge, Button, Flex, Table } from "@radix-ui/themes";
import { PostDeleteButton } from "@/components/PostDeleteButton";

interface Props {
	posts: Post[];
}

export const PostTable = ({ posts }: Props) => {
	return (
		<Table.Root variant="surface">
			<Table.Header>
				<Table.Row>
					<Table.ColumnHeaderCell>タイトル</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell>ステータス</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell>作成日</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell align="right">操作</Table.ColumnHeaderCell>
				</Table.Row>
			</Table.Header>

			<Table.Body>
				{posts.length === 0 ? (
					<Table.Row>
						<Table.Cell colSpan={4} align="center">
							記事がありません
						</Table.Cell>
					</Table.Row>
				) : (
					posts.map((post) => (
						<Table.Row key={post.id} align="center">
							<Table.Cell>
								<a
									href={`/admin/posts/${post.id}`}
									style={{
										color: "inherit",
										textDecoration: "none",
										fontWeight: "bold",
									}}
								>
									{post.title}
								</a>
								<div
									style={{
										fontSize: "var(--font-size-1)",
										color: "var(--gray-9)",
										marginTop: "4px",
									}}
								>
									/{post.slug}
								</div>
							</Table.Cell>
							<Table.Cell>
								{post.isPublished ? (
									<Badge color="green">公開中</Badge>
								) : (
									<Badge color="gray">下書き</Badge>
								)}
								{post.noindex && (
									<Badge color="orange" ml="2">
										noindex
									</Badge>
								)}
							</Table.Cell>
							<Table.Cell>
								{new Date(post.createdAt).toLocaleDateString("ja-JP")}
							</Table.Cell>
							<Table.Cell align="right">
								<Flex gap="2" justify="end">
									<Button
										variant="soft"
										onClick={() =>
											(window.location.href = `/admin/posts/${post.id}`)
										}
									>
										編集
									</Button>
									<PostDeleteButton postId={post.id} />
								</Flex>
							</Table.Cell>
						</Table.Row>
					))
				)}
			</Table.Body>
		</Table.Root>
	);
};
