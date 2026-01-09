import { SQL } from "bun";

if (!process.env.DATABASE_URL && process.env.NODE_ENV != 'TEST') {
	throw new Error("DATABASE_URL env is undefined.");
}

const pg = new SQL({
	bigint: true,
})

export { pg }