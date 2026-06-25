import { Marked } from "marked";
import createShikiPlugin from "marked-shiki";
import { bundledLanguages, createHighlighter } from "shiki";

const highlighter = await createHighlighter({
	themes: ["github-dark", "github-light"],
	langs: Object.keys(bundledLanguages),
});

const marked = new Marked();

marked.use(
	createShikiPlugin({
		highlight: (code, lang) => {
			return highlighter.codeToHtml(code, {
				lang,
				theme: "github-dark",
			});
		},
	}),
);

marked.use({
	renderer: {
		codespan({ text }) {
			return `<code class="px-1.5 py-0.5 mx-0.5 rounded-md bg-(--gray-3) text-(--gray-12) font-mono text-[0.9em] border border-(--gray-4)">${text}</code>`;
		},
	},
});

if (import.meta.env.DEV) {
	import.meta.hot?.on("vite:beforeFullReload", () => {
		highlighter.dispose();
	});
}

export async function renderMarkdown(markdown: string) {
	return marked.parse(markdown);
}
