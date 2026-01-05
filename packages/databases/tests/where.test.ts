import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { prep } from "./mock";
import { tests } from "../src/orm/tables";
import { greatThan, lessThan, greatThanOrEqualTo, lessThanOrEqualTo, between } from "../src/orm/operators/numeric";

describe('WHERE', async () => {
	const { select, data, populate, clearUser } = await prep()

	beforeAll(populate)
	afterAll(clearUser)

	it('filters records by an exact match on a single field using one WHERE clause', async () => {
		const result = await select(tests)
			.where({ id: 1 })
			.run()

		expect(result).toBeArrayOfSize(1)
		expect(result?.[0]).toContainAnyKeys(Object.keys(data[0]))
	})

	it('filters records by matching any value in an array for a single field', async () => {
		const result = await select(tests)
			.where({ id: [1, 2] })
			.run()

		expect(result).toBeArrayOfSize(2)
		expect(result?.find(value => value.id == 1)).toBeDefined()
		expect(result?.find(value => value.id == 2)).toBeDefined()
	})

	it('combines multiple WHERE clauses using OR semantics for the same field', async () => {
		const result = await select(tests)
			.where({ id: 1 })
			.where({ id: 2 })
			.run()

		expect(result).toBeArrayOfSize(2)
		expect(result?.find(value => value.id == 1)).toBeDefined()
		expect(result?.find(value => value.id == 2)).toBeDefined()
	})

	it('combines compound conditions within a WHERE clause and ORs them with another WHERE clause', async () => {
		const result = await select(tests)
			.where({ id: [1, 2], text: 'example text value' })
			.where({ id: 3 })
			.run()

		expect(result).toBeArrayOfSize(3)
		expect(result?.find(value => value.id == 1)).toBeDefined()
		expect(result?.find(value => value.id == 2)).toBeDefined()
		expect(result?.find(value => value.id == 3)).toBeDefined()
	})

	it('filters records using a greater-than comparison operator', async () => {
		const result = await select(tests).where({ id: greatThan(15) }).run();

		expect(result).toBeArrayOfSize(5)
		expect(result?.filter(value => [16, 17, 18, 19, 20].includes(value.id))).toBeArrayOfSize(5)
	});

	it('filters records using a less-than comparison operator', async () => {
		const result = await select(tests).where({ id: lessThan(6) }).run();

		expect(result).toBeArrayOfSize(5)
		expect(result?.filter(value => [1, 2, 3, 4, 5].includes(value.id))).toBeArrayOfSize(5)
	});

	it('filters records using a greater-than-or-equal-to comparison operator', async () => {
		const result = await select(tests).where({ id: greatThanOrEqualTo(16) }).run();

		expect(result).toBeArrayOfSize(5)
		expect(result?.filter(value => [16, 17, 18, 19, 20].includes(value.id))).toBeArrayOfSize(5)
	});

	it('filters records using a less-than-or-equal-to comparison operator', async () => {
		const result = await select(tests).where({ id: lessThanOrEqualTo(5) }).run();

		expect(result).toBeArrayOfSize(5)
		expect(result?.filter(value => [1, 2, 3, 4, 5].includes(value.id))).toBeArrayOfSize(5)
	});

	it('filters records using a between (inclusive range) comparison operator', async () => {
		const result = await select(tests).where({ id: between(1, 5) }).run();

		expect(result).toBeArrayOfSize(5)
		expect(result?.filter(value => [1, 2, 3, 4, 5].includes(value.id))).toBeArrayOfSize(5)
	});
});
