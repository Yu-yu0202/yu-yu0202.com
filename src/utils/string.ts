export function replacePlaceholder(template: string, value: string): string;

export function replacePlaceholder(
	template: string,
	value: string,
	placeholder: string = "{}",
): string {
	return template.replace(placeholder, value);
}
