/// <reference path="../.astro/types.d.ts" types="astro/client" />

declare namespace App {
	export interface Locals {
		user?: import("./utils/jwt").JWTPayload;
	}
}

interface ImportMetaEnv {
	readonly DATABASE_URL: string;
	readonly JWT_SECRET: string;
	readonly WEBSITE_URL: string;
	readonly UMAMI_SCRIPT_URL?: string;
	readonly UMAMI_DASHBOARD_URL?: string;
	readonly UMAMI_WEBSITE_ID?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
