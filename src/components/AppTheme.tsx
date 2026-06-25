import { Theme } from "@radix-ui/themes/dist/esm/components/theme.js";
import type { ReactNode } from "react";

interface Props {
	children: ReactNode;
	className?: string;
	hasBackground?: boolean;
}

export const AppTheme = ({ children, className, hasBackground }: Props) => {
	return (
		<Theme
			accentColor="iris"
			grayColor="slate"
			radius="small"
			hasBackground={hasBackground}
			className={className}
		>
			{children}
		</Theme>
	);
};
