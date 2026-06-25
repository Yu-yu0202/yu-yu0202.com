import type { Users } from "@database/schema";
import { type JWTPayload as JWTPayloadI, jwtVerify, SignJWT } from "jose";

export interface JWTPayload extends JWTPayloadI {
	sub: Users["id"];
	displayName: Users["displayName"];
}

const SECRET = new TextEncoder().encode(Bun.env["JWT_SECRET"]!);

export async function signJWT(
	payload: JWTPayload,
	expiresTime: number | string,
) {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime(expiresTime)
		.setIssuedAt()
		.sign(SECRET);
}

export async function verifyJWT(
	token: string,
): Promise<JWTPayload | undefined> {
	try {
		const { payload } = await jwtVerify<JWTPayload>(token, SECRET);
		return payload;
	} catch {
		return undefined;
	}
}
