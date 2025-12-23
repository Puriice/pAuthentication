import { sql } from "bun";
import type { ReducedColumns } from ".";
import type { Column, ColumnKey, FilteredTableDefinition, Row, Rows, SelectQueryReturn, Table, TableDefinition } from "../../types"



export class SelectObject<D extends TableDefinition> {
	private keys: ReducedColumns<D>[0]
	private allColumns: ReducedColumns<D>[1]

	constructor(private sql: Bun.SQL, private table: Table<D>) {
		const entries = Object.entries(this.table.definition.columns);

		const [keys, allColumns]: ReducedColumns<D> = entries.reduce((prev, [key, value]) => {
			prev[0].push(key)
			prev[1].push(value.name)

			return prev;
		}, [[], []] as ReducedColumns<D>)

		this.keys = keys;
		this.allColumns = allColumns;
	}

	async run(): Promise<Rows<D>>
	async run<C extends readonly Column<D, ColumnKey<D>>[]>(
		...columns: C
	): Promise<Rows<FilteredTableDefinition<D, C>>>;
	async run<C extends readonly Column<D, ColumnKey<D>>[]>(...columns: C): Promise<Rows<D>> {
		if (columns.length > 0) {
			const returns: SelectQueryReturn<FilteredTableDefinition<D, C>>[] = await this.sql`SELECT ${sql.unsafe(columns.map(col => col.column).join(', '))} FROM ${sql(this.table.definition.name)} `.values()

			return returns.map(values => {
				return values.reduce((prev, curr, i) => {
					prev[columns[i]?.key!] = curr;
					return prev;
				}, {} as Row<FilteredTableDefinition<D, C>>)
			})
		}


		const returns: SelectQueryReturn<D>[] = await this.sql`SELECT ${sql.unsafe(this.allColumns.join(', '))} FROM ${sql(this.table.definition.name)} `.values()

		return returns.map(values => {
			return values.reduce((prev, curr, i) => {
				prev[this.keys[i]!] = curr;
				return prev;
			}, {} as Row<D>)
		})
	}
}