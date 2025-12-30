import { password } from "bun"
import { users } from "../../src/orm/tables"
import { use } from "../../src/orm"
import { createSQL } from "./pg"
import type { Rows } from "../../types";
import type { usersTable } from "../../src/tables";

export async function prep() {
	const pg = createSQL();

	const { select, insert, del } = use(pg)

	const passwd = password.hash('TestPassword')

	const data = [
		{
			username: 'TEST1',
			firstname: 'John',
			lastname: 'Doe',
			birthday: new Date('2004-04-08'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		},
		{
			username: 'TEST2',
			firstname: 'Jane',
			lastname: 'Doe',
			birthday: new Date('2003-02-20'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		},
		{
			username: 'TEST3',
			firstname: 'Alice',
			lastname: 'Smith',
			birthday: new Date('1994-07-10'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		},
		{
			username: 'TEST4',
			firstname: 'Bob',
			lastname: 'Smith',
			birthday: new Date('1993-11-02'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		},
		{
			username: 'TEST5',
			firstname: 'Charlie',
			lastname: 'Brown',
			birthday: new Date('1998-05-18'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		},
		{
			username: 'TEST6',
			firstname: 'Diana',
			lastname: 'Brown',
			birthday: new Date('1997-09-09'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		},
		{
			username: 'TEST7',
			firstname: 'Ethan',
			lastname: 'Wilson',
			birthday: new Date('1992-12-30'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		},
		{
			username: 'TEST8',
			firstname: 'Fiona',
			lastname: 'Wilson',
			birthday: new Date('1999-04-14'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		},
		{
			username: 'TEST9',
			firstname: 'George',
			lastname: 'Miller',
			birthday: new Date('1991-06-21'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		},
		{
			username: 'TEST10',
			firstname: 'Hannah',
			lastname: 'Miller',
			birthday: new Date('1995-08-03'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		},
		{
			username: 'TEST11',
			firstname: 'Ian',
			lastname: 'Taylor',
			birthday: new Date('1996-10-11'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		},
		{
			username: 'TEST12',
			firstname: 'Julia',
			lastname: 'Taylor',
			birthday: new Date('1994-02-27'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		},
		{
			username: 'TEST13',
			firstname: 'Kevin',
			lastname: 'Anderson',
			birthday: new Date('1990-01-05'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		},
		{
			username: 'TEST14',
			firstname: 'Laura',
			lastname: 'Anderson',
			birthday: new Date('1993-03-19'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		},
		{
			username: 'TEST15',
			firstname: 'Michael',
			lastname: 'Thomas',
			birthday: new Date('1997-07-25'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		},
		{
			username: 'TEST16',
			firstname: 'Nina',
			lastname: 'Thomas',
			birthday: new Date('1998-09-01'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		},
		{
			username: 'TEST17',
			firstname: 'Oliver',
			lastname: 'Jackson',
			birthday: new Date('1992-04-08'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		},
		{
			username: 'TEST18',
			firstname: 'Paula',
			lastname: 'Jackson',
			birthday: new Date('1996-06-16'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		},
		{
			username: 'TEST19',
			firstname: 'Quentin',
			lastname: 'White',
			birthday: new Date('1991-10-29'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		},
		{
			username: 'TEST20',
			firstname: 'Rachel',
			lastname: 'White',
			birthday: new Date('1999-12-12'),
			password: await passwd,
			createAt: new Date(),
			lastModified: new Date()
		}
	] as const satisfies Rows<typeof usersTable>

	async function populateUser() {
		await insert(users).run(
			...data
		)
	}

	async function clearUser() {
		await del(users).danger().run();
	}

	return { pg, select, insert, del, data, populateUser, clearUser, close: pg.close }
}
