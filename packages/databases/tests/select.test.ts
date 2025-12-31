import { tests, users } from '../src/orm/tables'
import { expect, describe, it, beforeAll, afterAll } from 'bun:test'
import { prep } from './mock';

describe('SELECT', async () => {
	const { select, data, populate, clearUser, close } = await prep()

	beforeAll(populate)
	afterAll(clearUser)
	// afterAll(close)

	it('Can query all columns', async () => {
		const result = await select(tests).run();

		expect(result).toBeArray();
		expect(result).toHaveLength(20)
	})

	it('Can proper query with specific columns', async () => {
		const result = await select(tests).run(
			tests.columns.id,
			tests.columns.uuid
		)

		expect(result).toBeArray();
		expect(result?.[0]).toHaveProperty('id')
		expect(result?.[0]).toHaveProperty('uuid')
	})

	it('Can collectly query a data with a single where clause and single condition', async () => {
		const result = await select(tests)
			.where({ id: 1 })
			.run()

		expect(result).toBeArrayOfSize(1)
		expect(result?.[0]).toContainAnyKeys(Object.keys(data[0]))
	})

	it('Can collectly query a data with a single tuple where clause single condition', async () => {
		const result = await select(tests)
			.where({ id: [1, 2] })
			.run()

		expect(result).toBeArrayOfSize(2)
		expect(result).toContainEqual(data.find(value => value.id === 1)!)
		expect(result).toContainEqual(data.find(value => value.id === 2)!)
	})

	it('Can collectly query a data with a single where clause and multiple condition', async () => {
		const result = await select(tests)
			.where({ id: 1 })
			.where({ id: 2 })
			.run()

		expect(result).toBeArrayOfSize(2)
		expect(result).toContainEqual(data.find(value => value.id === 1)!)
		expect(result).toContainEqual(data.find(value => value.id === 2)!)
	})

	it('Can collectly query a data with a tuple where clause and multiple condition', async () => {
		const result = await select(tests)
			.where({ id: [1, 2], text: 'example text value' })
			.where({ id: 3 })
			.run()

		expect(result).toBeArrayOfSize(3)
		expect(result).toContainEqual(data[0])
		expect(result).toContainEqual(data[1])
		expect(result).toContainEqual(data[2])
		expect(result).not.toContainEqual(data[3])
	})

	it('Can query a data with limit and offset', async () => {
		const query = select(tests).orderBy(tests.columns.createAt)

		const firstPage = query.page({
			limit: 10,
			offset: 0,
		}).run()

		const secondPage = query.page({
			limit: 10,
			offset: 10
		}).run()

		expect(await firstPage).toBeArrayOfSize(10)
		expect(await secondPage).toBeArrayOfSize(10)
		expect(await firstPage).toEqual(data.slice(0, 10))
		expect(await secondPage).toEqual(data.slice(10, 20))
	})

	it('Can query a data with pagination with default length', async () => {
		const query = select(tests).orderBy(tests.columns.createAt)

		const firstPage = query.page({
			page: 1
		}).run()

		const secondPage = query.page({
			page: 2
		}).run()

		expect(await firstPage).toBeArrayOfSize(10)
		expect(await secondPage).toBeArrayOfSize(10)
		expect(await firstPage).toEqual(data.slice(0, 10))
		expect(await secondPage).toEqual(data.slice(10, 20))
	})

	it('Can query a data with pagination with 5 datas on each page', async () => {
		const query = select(tests).orderBy(tests.columns.createAt)

		const firstPage = query.page({
			page: 1,
			length: 5,
		}).run()

		const secondPage = query.page({
			page: 2,
			length: 5
		}).run()

		expect(await firstPage).toBeArrayOfSize(5)
		expect(await secondPage).toBeArrayOfSize(5)
		expect(await firstPage).toEqual(data.slice(0, 5))
		expect(await secondPage).toEqual(data.slice(5, 10))
	})
});
