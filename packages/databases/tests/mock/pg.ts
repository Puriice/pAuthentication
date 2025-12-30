import { SQL } from 'bun';
import os from 'os'

interface Options {
	hostname: string;
	port: number;
	database: string;
	username: string;
	password: string;
}

export function createSQL({
	hostname = 'localhost',
	port = 5432,
	database = 'forTest',
	username = os.userInfo().username,
	password = process.env.DB_PASSWD
}: Partial<Options> = {}): Bun.SQL {
	return new SQL({
		hostname,
		port,
		database,
		username,
		password
	})
}