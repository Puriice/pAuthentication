import { emails, users } from '../src/orm/tables'
import { test, expect } from 'bun:test'

test('Query All users', async () => {
	const result = await users()

	expect(result).toBeArray();
})

test('Query with filter', async () => {
	const result = await users('username = "test1"')

	expect(result[0]?.username).toBe('test1')
})

test('Insert user', async () => {
	await users.insert(
		{
			'username': 'test3',
			'password': '-',
			'firstname': 'Jody',
			'lastname': 'Doe',
			'birthday': new Date()
		}
	)

	const result = await users('username = "test3"')

	expect(result[0]?.username).toBe('test3')
})