import { user } from '../src/orm/tables'
import { test, expect } from 'bun:test'

test('Query All users', async () => {
	const result = await user()

	console.log(result)

	expect(result).toBeArray();
})