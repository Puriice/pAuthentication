import { users } from '../src/orm/tables'
import { expect, describe, it, beforeAll, afterAll } from 'bun:test'
import { prep } from './mock';

describe('Select Operation', async () => {
	const { select, data, populateUser, clearUser, close } = await prep()

	beforeAll(populateUser)
	afterAll(clearUser)
	afterAll(close)

	it('Can query all columns', async () => {
		const result = await select(users).run();

		expect(result).toBeArray();
		expect(result).toHaveLength(20)
	})

	it('Can proper query with specific columns', async () => {
		const result = await select(users).run(
			users.columns.firstname,
			users.columns.lastname
		)

		expect(result).toBeArray();
		expect(result?.[0]).toHaveProperty('firstname')
		expect(result?.[0]).toHaveProperty('lastname')
	})

	it('Can collectly query a data with a single where clause and single condition', async () => {
		const result = await select(users)
			.where({ firstname: 'John' })
			.run()

		expect(result).toBeArrayOfSize(1)
		expect(result).toContainEqual(data[0])
	})

	it('Can collectly query a data with a single tuple where clause single condition', async () => {
		const result = await select(users)
			.where({ firstname: ['John', 'Jane'] })
			.run()

		expect(result).toBeArrayOfSize(2)
		expect(result).toContainEqual(data[0])
		expect(result).toContainEqual(data[1])
	})

	it('Can collectly query a data with a single where clause and multiple condition', async () => {
		const result = await select(users)
			.where({ firstname: 'John' })
			.where({ firstname: 'Jane' })
			.run()

		expect(result).toBeArrayOfSize(2)
		expect(result).toContainEqual(data[0])
		expect(result).toContainEqual(data[1])
	})

	it('Can collectly query a data with a tuple where clause and multiple condition', async () => {
		const result = await select(users)
			.where({ firstname: ['John', 'Jane', 'Bob'], lastname: 'Doe' })
			.where({ firstname: 'Alice' })
			.run()

		expect(result).toBeArrayOfSize(3)
		expect(result).toContainEqual(data[0])
		expect(result).toContainEqual(data[1])
		expect(result).toContainEqual(data[2])
		expect(result).not.toContainEqual(data[3])
	})
});
