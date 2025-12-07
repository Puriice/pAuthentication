import { users } from '../src/orm/tables'
import { test, expect } from 'bun:test'

test('Query All users', async () => {
	const result = await users()

	expect(result).toBeArray();
})

test('Query users count', async () => {
	const result = await users.count()

	expect(result).toBeNumber();
})

test.skip('Insert user', async () => {
	await users.insert(
		{
			'username': 'test3',
			'password': '-',
			'firstname': 'Jody',
			'lastname': 'Doe',
			'birthday': new Date()
		}
	)

	const result = await users()

	expect(result.find(user => user.username == 'test3')?.username).toBe('test3')
})