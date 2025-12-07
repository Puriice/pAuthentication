import { emails, users } from '../src/orm/tables'
import { test, expect } from 'bun:test'

test('Query All users', async () => {
	const result = await users()

	expect(result).toBeArray();
})