import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { prep } from "./mock"
import { tests } from "../src/orm/tables"

describe('DELETE', async () => {
	const { select, count, del, populate, clearUser } = await prep()

	beforeEach(populate)
	afterEach(clearUser)

	it('deletes a single record by an exact match on a single field using one where clause', async () => {
		const deleteResult = del(tests).run({ id: 1 })

		expect(await deleteResult).toBeTrue()

		const notExistQuery = select(tests).where({ id: 1 }).run();
		expect(await notExistQuery).toBeArrayOfSize(0)
	});

	it('deletes a multiple records by matching any values in an array for single field', async () => {
		const deleteResult = del(tests).run({
			id: [1, 2]
		})

		expect(await deleteResult).toBeTrue()

		const notExistQuery = select(tests).where({ id: [1, 2] }).run();
		expect(await notExistQuery).toBeArrayOfSize(0)
	})

	it('deletes a multiple records by combines multiple WHERE clauses using OR semantics for the same field', async () => {
		const deleteResult = del(tests).run({
			id: 1
		}, {
			id: 2
		})

		expect(await deleteResult).toBeTrue()

		const notExistQuery = select(tests).where({ id: [1, 2] }).run();
		expect(await notExistQuery).toBeArrayOfSize(0)
	})

	it('rejects an delete operation when no WHERE clause is provided in safe mode', async () => {
		const deleteResult = del(tests).run()

		expect(await deleteResult).not.toBeTrue()
	})

	it('allows a full-table delete without a WHERE clause when danger mode is enabled', async () => {
		const deleteResult = del(tests).danger().run()

		expect(await deleteResult).toBeTrue()

		const rowCount = await count(tests);

		expect(rowCount).toBe(0)
	})

	it('reverts to safe mode after danger mode and rejects a full-table update without a WHERE clause', async () => {
		const deleteResult = del(tests).danger().safe().run()

		expect(await deleteResult).not.toBeTrue()
	})
})