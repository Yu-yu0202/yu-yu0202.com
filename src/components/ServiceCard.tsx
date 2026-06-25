import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Box, Card, Flex, Heading, Inset, Text } from "@radix-ui/themes";
import type { ReactNode } from "react";

type Props = {
	href: string;
	title: string;
	description: string;
	children: ReactNode;
};

export const ServiceCard = ({ href, title, description, children }: Props) => {
	return (
		<Card className="service-card" asChild>
			<a href={href} className="block no-underline">
				<Flex gap="3" align="start">
					<Inset clip="padding-box" side="left" pb="0">
						{children}
					</Inset>

					<Box className="flex-1 pr-6">
						<Heading as="h2" size="5">
							{title}
						</Heading>
						<Text mt="0" size="3" className="text-(--gray-11)">
							{description}
						</Text>
					</Box>

					<div className="service-card-arrow shrink-0 pt-1">
						<ArrowRightIcon />
					</div>
				</Flex>
			</a>
		</Card>
	);
};
