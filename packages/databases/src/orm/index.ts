import { sql } from "bun";
import type { ColumnNames, Column, Row, Table, TableDefinition, ColumnKey, FilteredTableDefinition, SelectQueryReturn, Rows } from "../../types";
import { pg } from "..";
import { SelectObject } from "./method";

export type ReducedColumns<D extends TableDefinition> = [
	(keyof D['columns'])[],
	ColumnNames<D>[]
]

export function where<D extends TableDefinition>(column: Column<D, ColumnKey<D>>) {
	return (strings: TemplateStringsArray, ...args: unknown[]) => {
		console.log(strings.raw)
	}
}

export function use(tx: Bun.SQL = sql) {
	function select<D extends TableDefinition>(table: Table<D>) {
		return new SelectObject(tx, table)
	}

	async function count<D extends TableDefinition>(table: Table<D>): Promise<number> {
		const [[count]]: [[string]] = await tx`SELECT COUNT(*) FROM ${sql(table.definition.name)}`.values()

		return Number(count);
	}

	function insert<D extends TableDefinition, C extends Column<D, ColumnKey<D>>[]>(table: Table<D>, ...columns: C) {
		return async (...values: Row<FilteredTableDefinition<D, C>>[]) => {
			if (values.length < 1) return false;

			const insertValues = values.map(value => {
				return Object.entries(value).reduce((prev, [key, value]) => {
					if (value instanceof Date) {
						value = value.toISOString().slice(0, 10)
					}

					prev[key] = value;

					return prev;
				}, {} as Record<string, unknown>)
			})

			await tx`INSERT INTO ${sql(table.definition.name)} ${sql(insertValues, ...columns.map(col => col?.column))}`

			return true;
		}
	}

	return {
		select,
		count,
		insert
	};
}

export const { select, count, insert } = use(pg)


