import { SQL } from "bun";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL env is undefined.");
}

const connection = new SQL({
	onconnect: () => {
		console.log("Connected to PostgreSQL");
	},
	onclose: () => {
		console.log("PostgreSQL connection closed");
	},
})

export { connection }