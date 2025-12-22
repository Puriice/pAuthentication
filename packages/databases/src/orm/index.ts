import { sql } from "bun";
import type { ColumnNames, Column, Row, Table, TableDefinition, ColumnKey, FilteredTableDefinition, SelectQueryReturn, Rows } from "../../types";

type ReducedColumns<D extends TableDefinition> = [
	(keyof D['columns'])[],
	ColumnNames<D>[]
]

export function where<D extends TableDefinition>(column: Column<D, ColumnKey<D>>) {
	return (strings: TemplateStringsArray, ...args: unknown[]) => {
		console.log(strings.raw)
	}
}

export function use(tx: Bun.SQL = sql) {
	async function select<D extends TableDefinition, C extends readonly Column<D, ColumnKey<D>>[]>(table: D, ...columns: C): Promise<Rows<D>> {
		if (columns.length > 0) {
			const returns: SelectQueryReturn<FilteredTableDefinition<D, C>>[] = await tx`SELECT ${sql.unsafe(columns.map(col => col.column).join(', '))} FROM ${sql(table.name)} `.values()


			return returns.map(values => {
				return values.reduce((prev, curr, i) => {
					prev[columns[i]?.key!] = curr;
					return prev;
				}, {} as Row<FilteredTableDefinition<D, C>>)
			})
		}

		const entries = Object.entries(table.columns);

		const [keys, allColumns]: ReducedColumns<D> = entries.reduce((prev, [key, value]) => {
			prev[0].push(key)
			prev[1].push(value.name)

			return prev;
		}, [[], []] as ReducedColumns<D>)


		const returns: SelectQueryReturn<D>[] = await tx`SELECT ${sql.unsafe(allColumns.join(', '))} FROM ${sql(table.name)} `.values()

		return returns.map(values => {
			return values.reduce((prev, curr, i) => {
				prev[keys[i]!] = curr;
				return prev;
			}, {} as Row<D>)
		})
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

export const { select, count, insert } = use(sql)


