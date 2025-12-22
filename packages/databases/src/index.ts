import { SQL } from "bun";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL env is undefined.");
}

const pg = new SQL()

export { pg }