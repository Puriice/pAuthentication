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