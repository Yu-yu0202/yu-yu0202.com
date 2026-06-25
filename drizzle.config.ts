import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/database/schema/index.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: import.meta.env.DATABASE_URL!,
	},
});
