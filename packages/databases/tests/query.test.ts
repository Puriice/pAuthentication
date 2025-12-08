import { count } from '../src/orm';
import { users } from '../src/orm/tables'
import { test, expect } from 'bun:test'

test('Query All users', async () => {
	const result = await users()

	expect(result).toBeArray();
})

test('Query users count', async () => {
	const result = await count(users)

	expect(result).toBeNumber();
})
