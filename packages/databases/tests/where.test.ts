import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { prep } from "./mock";
import { tests } from "../src/orm/tables";
import { greatThan, lessThan, greatThanOrEqualTo, lessThanOrEqualTo, between } from "../src/orm/operators/numeric";
import { not } from "../src/orm/operators";

describe('WHERE', async () => {
	const { select, data, populate, clearTable } = await prep()

	beforeAll(populate)
	afterAll(clearTable)

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

	describe('numeric comparison', () => {

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

		it('filters records using a not-greater-than comparison operator', async () => {
			const result = await select(tests).where({ id: not(greatThan(5)) }).run();

			expect(result).toBeArrayOfSize(5)
			expect(result?.filter(value => [1, 2, 3, 4, 5].includes(value.id))).toBeArrayOfSize(5)
		});

		it('filters records using a not-less-than comparison operator', async () => {
			const result = await select(tests).where({ id: not(lessThan(16)) }).run();

			expect(result).toBeArrayOfSize(5)
			expect(result?.filter(value => [16, 17, 18, 19, 20].includes(value.id))).toBeArrayOfSize(5)
		});

		it('filters records using a not-greater-than-or-equal-to comparison operator', async () => {
			const result = await select(tests).where({ id: not(greatThanOrEqualTo(6)) }).run();

			expect(result).toBeArrayOfSize(5)
			expect(result?.filter(value => [1, 2, 3, 4, 5].includes(value.id))).toBeArrayOfSize(5)
		});

		it('filters records using a not-less-than-or-equal-to comparison operator', async () => {
			const result = await select(tests).where({ id: not(lessThanOrEqualTo(15)) }).run();

			expect(result).toBeArrayOfSize(5)
			expect(result?.filter(value => [16, 17, 18, 19, 20].includes(value.id))).toBeArrayOfSize(5)
		});

		it('filters records using a not-between (inclusive range) comparison operator', async () => {
			const result = await select(tests).where({ id: not(between(6, 20)) }).run();

			expect(result).toBeArrayOfSize(5)
			expect(result?.filter(value => [1, 2, 3, 4, 5].includes(value.id))).toBeArrayOfSize(5)
		});
	});

	describe('existance', () => {
		it('filters records where the column value IS NULL', async () => {
			const result = await select(tests).where({ null: null }).run();

			expect(result).toBeArrayOfSize(10)
			expect(result?.every(value => value.null === null)).toBeTrue()
		});

		it('filters records where the column value IS NOT NULL', async () => {
			const result = await select(tests).where({ null: not(null) }).run();

			expect(result).toBeArrayOfSize(10)
			expect(result?.every(value => typeof value.null === 'number')).toBeTrue()
		});
	});
});
