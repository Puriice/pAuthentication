import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { prep } from "./mock"
import { tests } from "../src/orm/tables"

describe('UPDATE', async () => {
	const { select, update, populate, clearUser } = await prep()

	beforeEach(populate)
	afterEach(clearUser)

	const updateValue = {
		id: 99,
		smallint: 12,
		integer: 345,
		bigint: 9007199254740991n,
		numeric: "12345.67",
		real: 3.14,
		double: 2.718281828,
		varchar: "example varchar",
		text: "example text value",
		boolean: true,
		date: new Date("1995-06-15"),
		timestamp: new Date("2024-01-01T10:30:00"),
		timestamptz: new Date("2024-01-01T10:30:00Z"),
		interval: "2 days 03:04:05",
		uuid: "550e8400-e29b-41d4-a716-446655440000",
		json: { role: "admin", active: true },
		bytea: new Uint8Array([1, 2, 3, 4]),
		textArray: ["alpha", "beta", "gamma"],
		createAt: new Date("2024-01-01T10:30:00Z"),
		lastModified: new Date("2024-01-01T10:30:00Z")
	}

	it('updates a single row by replacing all column values, including the primary key', async () => {
		const updateResult = update(tests).where({ id: 1 }).run(updateValue)

		expect(await updateResult).toBeTrue()

		const notExistQuery = select(tests).where({ id: 1 }).run();

		expect(await notExistQuery).toBeArrayOfSize(0)

		const rows = select(tests).where({ id: 99 }).run();
		const result = (await rows)?.[0]

		expect(await rows).toBeArrayOfSize(1)
		expect(result).toHaveProperty('id', 99)
	});

	it('updates a single row by modifying only the specified columns and preserving all others', async () => {
		const updateResult = update(tests, tests.columns.smallint, tests.columns.integer).where({ id: 1 }).run({
			smallint: 30,
			integer: 5335,
		})

		expect(await updateResult).toBeTrue()


		const rows = select(tests).where({ id: 1 }).run();
		const result = (await rows)?.[0]

		expect(await rows).toBeArrayOfSize(1)
		expect(result).toHaveProperty('smallint', 30)
		expect(result).toHaveProperty('integer', 5335)
	})

	it('rejects a multi-row update that would cause a primary key conflict', async () => {
		const updateResult = update(tests).where({ id: [1, 2, 3] }).run(updateValue)

		expect(await updateResult).not.toBeTrue()


		const rows = select(tests).where({ id: [1, 2, 3] }).run();
		const result = await rows
		const first = result?.[0]
		const second = result?.[1]
		const thrid = result?.[2]

		expect(result).toBeArrayOfSize(3)
		expect(first).toHaveProperty('id', 1)
		expect(second).toHaveProperty('id', 2)
		expect(thrid).toHaveProperty('id', 3)
	})

	it('updates multiple rows by modifying only the specified columns and preserving all others', async () => {
		const updateResult = update(tests, tests.columns.smallint, tests.columns.integer).where({ id: [1, 2, 3] }).run({
			smallint: 30,
			integer: 5335,
		})

		expect(await updateResult).toBeTrue()


		const rows = select(tests).where({ id: [1, 2, 3] }).run();
		const result = await rows
		const first = result?.[0]
		const second = result?.[1]
		const thrid = result?.[2]

		expect(result).toBeArrayOfSize(3)
		expect(first).toHaveProperty('smallint', 30)
		expect(first).toHaveProperty('integer', 5335)
		expect(second).toHaveProperty('smallint', 30)
		expect(second).toHaveProperty('integer', 5335)
		expect(thrid).toHaveProperty('smallint', 30)
		expect(thrid).toHaveProperty('integer', 5335)
	})

	it('rejects an update operation when no WHERE clause is provided in safe mode', async () => {
		const updateResult = update(tests, tests.columns.smallint, tests.columns.integer).run({
			smallint: 30,
			integer: 5335,
		})

		expect(await updateResult).not.toBeTrue()
	})

	it('allows a full-table update without a WHERE clause when danger mode is enabled', async () => {
		const updateResult = update(tests, tests.columns.smallint, tests.columns.integer).danger().run({
			smallint: 30,
			integer: 5335,
		})

		expect(await updateResult).toBeTrue()

		const rows = await select(tests).run();

		expect(rows?.every(row => row.smallint === 30)).toBeTrue()
		expect(rows?.every(row => row.integer === 5335)).toBeTrue();
	})

	it('reverts to safe mode after danger mode and rejects a full-table update without a WHERE clause', async () => {
		const updateResult = update(tests, tests.columns.smallint, tests.columns.integer).danger().safe().run({
			smallint: 30,
			integer: 5335,
		})

		expect(await updateResult).not.toBeTrue()
	})
})