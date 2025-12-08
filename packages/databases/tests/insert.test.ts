import { expect, test } from "bun:test"
import { insert } from "../src/orm"
import { users } from "../src/orm/tables"

test.skip('Insert user', async () => {
	await insert(
		users,
		[
			{
				'username': 'test3',
				'password': '-',
				'firstname': 'Jody',
				'lastname': 'Doe',
				'birthday': new Date()
			},
			{
				'username': 'test4',
				'password': '-',
				'firstname': 'Jojo',
				'lastname': 'Doe',
				'birthday': new Date()
			}
		]
	)

	const result = await users()

	expect(result.find(user => user.username == 'test3')?.username).toBe('test3')
	expect(result.find(user => user.username == 'test4')?.username).toBe('test4')
})