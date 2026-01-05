import { afterEach, describe, expect, it } from "bun:test"
import { tests } from "../src/orm/tables"
import { prep } from "./mock";
import type { Row } from "../types";
import type { testsTable } from "../src/tables";

function filterColumns(result: unknown, blacklistKeys = ['id', 'createAt', 'lastModified']) {
	if (typeof result !== "object" || result == null) return {};

	return Object.entries(result).reduce((prev, [key, value]) => {
		if (blacklistKeys.includes(key)) return prev;

		prev[key] = value

		return prev;
	}, {} as Record<string, unknown>)
}

describe('INSERT', async () => {
	const { select, insert, data, clearUser } = await prep()

	afterEach(clearUser)

	it('Could insert a value with every column to the table', async () => {
		const insertQuery = insert(tests).run(data[0])

		await insertQuery;

		const result = select(tests).where({ id: data[0].id }).run()

		expect(await result).toBeArrayOfSize(1)
		expect((await result)?.[0]?.id).toBe(data[0].id)
	});

	it('Could insert a value with specific columns to the table', async () => {
		const insertQuery = insert(tests, tests.columns.id).run(data[0])

		await insertQuery;

		const rows = await select(tests).where({ id: data[0].id }).run()
		const result = rows?.[0]

		expect(rows).toBeArrayOfSize(1)
		expect(result?.id).toBe(data[0].id)
		expect(result).toContainKey("id")

		const filteredResult = filterColumns(result)

		expect(Object.values(filteredResult).every(value => value == null)).toBeTrue()
	});

	it('Could insert multiple values with every columns to the table', async () => {
		const insertQuery = insert(tests).run(data[0], data[1], data[2])

		await insertQuery;

		const result = select(tests).where({ id: [data[0].id, data[1].id, data[2].id] }).run()

		expect(await result).toBeArrayOfSize(3)
		expect((await result)?.[0]?.id).toBe(data[0].id)
		expect((await result)?.[1]?.id).toBe(data[1].id)
		expect((await result)?.[2]?.id).toBe(data[2].id)
	});

	it('Could insert multiple values with specific columns to the table', async () => {
		const insertQuery = insert(tests, tests.columns.id).run(data[0], data[1], data[2])

		await insertQuery;

		const result = select(tests).where({ id: [data[0].id, data[1].id, data[2].id] }).run()

		const first = (await result)?.[0]
		const second = (await result)?.[1]
		const third = (await result)?.[2]

		expect(await result).toBeArrayOfSize(3)
		expect(first?.id).toBe(data[0].id)
		expect(second?.id).toBe(data[1].id)
		expect(third?.id).toBe(data[2].id)

		const firstFilter = filterColumns(first)
		const secondFilter = filterColumns(second)
		const thirdFilter = filterColumns(third)

		expect(Object.values(firstFilter).every(value => value == null)).toBeTrue()
		expect(Object.values(secondFilter).every(value => value == null)).toBeTrue()
		expect(Object.values(thirdFilter).every(value => value == null)).toBeTrue()
	});
});
