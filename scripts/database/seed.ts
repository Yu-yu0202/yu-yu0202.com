import { db } from "@database";
import { users } from "@database/schema";
import { hash } from "@node-rs/argon2";

const passwordHash = await hash(Bun.env["PASSWORD"]!, {
	algorithm: 2,
});

await db.insert(users).values({
	username: "admin",
	displayName: "管理者",
	passwordHash: passwordHash,
});
