import { tests, users } from '../src/orm/tables'
import { expect, describe, it, beforeAll, afterAll } from 'bun:test'
import { prep } from './mock';
import { between, greatThan, greatThanOrEqualTo, lessThan, lessThanOrEqualTo } from '../src/orm/operators/numeric';

describe('SELECT', async () => {
	const { select, data, populate, clearUser } = await prep()

	beforeAll(populate)
	afterAll(clearUser)

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
		expect(result?.find(value => value.id == 1)).toBeDefined()
		expect(result?.find(value => value.id == 2)).toBeDefined()
	})

	it('Can collectly query a data with a single where clause and multiple condition', async () => {
		const result = await select(tests)
			.where({ id: 1 })
			.where({ id: 2 })
			.run()

		expect(result).toBeArrayOfSize(2)
		expect(result?.find(value => value.id == 1)).toBeDefined()
		expect(result?.find(value => value.id == 2)).toBeDefined()
	})

	it('Can collectly query a data with a tuple where clause and multiple condition', async () => {
		const result = await select(tests)
			.where({ id: [1, 2], text: 'example text value' })
			.where({ id: 3 })
			.run()

		expect(result).toBeArrayOfSize(3)
		expect(result?.find(value => value.id == 1)).toBeDefined()
		expect(result?.find(value => value.id == 2)).toBeDefined()
		expect(result?.find(value => value.id == 3)).toBeDefined()
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
		expect((await firstPage)?.filter(value => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(value.id))).toBeArrayOfSize(10)
		expect((await secondPage)?.filter(value => [11, 12, 13, 14, 15, 16, 17, 18, 19, 20].includes(value.id))).toBeArrayOfSize(10)
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
		expect((await firstPage)?.filter(value => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(value.id))).toBeArrayOfSize(10)
		expect((await secondPage)?.filter(value => [11, 12, 13, 14, 15, 16, 17, 18, 19, 20].includes(value.id))).toBeArrayOfSize(10)
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
		expect((await firstPage)?.filter(value => [1, 2, 3, 4, 5].includes(value.id))).toBeArrayOfSize(5)
		expect((await secondPage)?.filter(value => [6, 7, 8, 9, 10].includes(value.id))).toBeArrayOfSize(5)
	})

	it('Can query a data with a great than query', async () => {
		const result = await select(tests).where({ id: greatThan(15) }).run();

		expect(result).toBeArrayOfSize(5)
		expect(result?.filter(value => [16, 17, 18, 19, 20].includes(value.id))).toBeArrayOfSize(5)
	});

	it('Can query a data with a less than query', async () => {
		const result = await select(tests).where({ id: lessThan(6) }).run();

		expect(result).toBeArrayOfSize(5)
		expect(result?.filter(value => [1, 2, 3, 4, 5].includes(value.id))).toBeArrayOfSize(5)
	});

	it('Can query a data with a great than or equal to query', async () => {
		const result = await select(tests).where({ id: greatThanOrEqualTo(16) }).run();

		expect(result).toBeArrayOfSize(5)
		expect(result?.filter(value => [16, 17, 18, 19, 20].includes(value.id))).toBeArrayOfSize(5)
	});

	it('Can query a data with a less than or equal to query', async () => {
		const result = await select(tests).where({ id: lessThanOrEqualTo(5) }).run();

		expect(result).toBeArrayOfSize(5)
		expect(result?.filter(value => [1, 2, 3, 4, 5].includes(value.id))).toBeArrayOfSize(5)
	});

	it('Can query a data with a between query', async () => {
		const result = await select(tests).where({ id: between(1, 5) }).run();

		expect(result).toBeArrayOfSize(5)
		expect(result?.filter(value => [1, 2, 3, 4, 5].includes(value.id))).toBeArrayOfSize(5)
	});
});
