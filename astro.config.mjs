// @ts-check

import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
	output: "static",

	adapter: node({
		mode: "standalone",
	}),

	integrations: [react()],

	fonts: [
		{
			provider: fontProviders.local(),
			name: "Gen Interface JP",
			cssVariable: "--font-gen-interface-jp",
			options: {
				variants: [
					{
						src: ["./src/assets/fonts/GenInterfaceJP-Light.woff2"],
						weight: 300,
						style: "normal",
						display: "swap",
					},
					{
						src: ["./src/assets/fonts/GenInterfaceJP-Regular.woff2"],
						weight: 400,
						style: "normal",
						display: "swap",
					},
					{
						src: ["./src/assets/fonts/GenInterfaceJP-Medium.woff2"],
						weight: 500,
						style: "normal",
						display: "swap",
					},
					{
						src: ["./src/assets/fonts/GenInterfaceJP-SemiBold.woff2"],
						weight: 600,
						style: "normal",
						display: "swap",
					},
					{
						src: ["./src/assets/fonts/GenInterfaceJP-Bold.woff2"],
						weight: 700,
						style: "normal",
						display: "swap",
					},
				],
			},
		},
	],

	image: {
		domains: ["skillicons.dev"],
	},

	vite: {
		build: {
			chunkSizeWarningLimit: 1024,
			rolldownOptions: {
				output: {
					manualChunks: {
						"vendor-editor": ["@uiw/react-md-editor", "rehype-sanitize"],
					},
				},
			},
		},
		plugins: [tailwindcss()],
	},
});
