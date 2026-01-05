import { tests } from '../src/orm/tables'
import { expect, describe, it, beforeAll, afterAll } from 'bun:test'
import { prep } from './mock';

describe('SELECT', async () => {
	const { select, data, populate, clearUser } = await prep()

	beforeAll(populate)
	afterAll(clearUser)

	it('returns all rows and all columns when no projection is specified', async () => {
		const result = await select(tests).run();

		expect(result).toBeArray();
		expect(result).toHaveLength(20)
	})

	it('returns only the explicitly selected columns when a column projection is provided', async () => {
		const result = await select(tests).run(
			tests.columns.id,
			tests.columns.uuid
		)

		expect(result).toBeArray();
		expect(result?.[0]).toContainAllKeys(['id', 'uuid'])
	})

	it('applies limit and offset correctly when paginating a sorted result set', async () => {
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

	it('paginates results using the default page length when only the page number is provided', async () => {
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

	it('paginates results using a custom page length', async () => {
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

	it('safely escapes input values to prevent SQL injection attacks', async () => {
		const result = await select(tests).where({ text: '\' OR 1=1 --' }).run()

		expect(result).toBeEmpty()
	});

});
