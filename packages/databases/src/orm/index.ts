import { sql } from "bun";
import type { ColumnNames, Column, Row, Table, TableDefinition, ColumnKey } from "../../types";

export function where<D extends TableDefinition>(column: Column<D, ColumnKey<D>>) {
	return (strings: TemplateStringsArray, ...args: unknown[]) => {
		console.log(strings.raw)
	}
}

export async function count<D extends TableDefinition>(table: Table<D>): Promise<number> {
	const [[count]]: [[string]] = await sql`SELECT COUNT(*) FROM ${sql(table.definition.name)}`.values()

	return Number(count);
}

export async function insert<D extends TableDefinition>(table: Table<D>, values: Row<D>[], ...columns: ColumnNames<D>[]) {
	const insertValues = values.map(value => {
		return Object.entries(value).reduce((prev, [key, value]) => {
			if (value instanceof Date) {
				value = value.toISOString().slice(0, 10)
			}

			prev[key] = value;

			return prev;
		}, {} as Record<string, unknown>)
	})

	await sql`INSERT INTO ${sql(table.definition.name)} ${sql(insertValues, ...columns)}`

}