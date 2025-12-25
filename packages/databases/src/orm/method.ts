import { sql } from "bun";
import { pushTemplate, raw } from 'literals'
import type { Column, ColumnKey, FilteredTableDefinition, Row, Rows, SelectQueryReturn, Table, TableDefinition } from "../../types"

type WhereCondition<D extends TableDefinition> = Partial<{
	[C in keyof D['columns']]: D['columns'][C]['type'][]
}>

interface WhereableObject<D extends TableDefinition> {
	condition: WhereCondition<D> | null;
}

function where<D extends TableDefinition, W extends WhereableObject<D>>(this: W, condition: WhereCondition<D>): W {
	this.condition = condition;
	return this;
}

export class SelectObject<D extends TableDefinition> implements WhereableObject<D> {
	public readonly condition: WhereCondition<D> | null = null;
	public readonly where: typeof where<D, SelectObject<D>> = where
	private isForUpdate: boolean = false;

	constructor(private sql: Bun.SQL, private table: Table<D>) { }

	async forUpdate() {
		this.isForUpdate = true;

		return this;
	}

	async run(): Promise<Rows<D>>
	async run<C extends readonly Column<D, ColumnKey<D>>[]>(
		...columns: C
	): Promise<Rows<FilteredTableDefinition<D, C>>>;
	async run<C extends readonly Column<D, ColumnKey<D>>[]>(...columns: C): Promise<Rows<D>> {
		if (columns.length == 0) {
			columns = Object.values(this.table.columns) as unknown as C
		}

		let tagged = raw`SELECT ${sql.unsafe(columns.map(col => col.column).join(', '))} FROM ${sql(this.table.definition.name)}`

		if (this.condition != null) {
			tagged = pushTemplate(tagged)` WHERE`

			const conditionEntries = Object.entries(this.condition)

			conditionEntries.forEach(([key, values]: [string, unknown[]], i: number) => {
				tagged = pushTemplate(tagged)` ${sql.unsafe(key)} IN ${sql(values)}`

				if (conditionEntries[i + 1] != undefined) {
					tagged = pushTemplate(tagged)` AND`
				}
			})
		}

		if (this.isForUpdate) {
			tagged = pushTemplate(tagged)` FOR UPDATE`
		}

		const returns: SelectQueryReturn<FilteredTableDefinition<D, C>>[] = await this.sql(tagged.strings, ...tagged.values).values()

		return returns.map(values => {
			return values.reduce((prev, curr, i) => {
				prev[columns[i]?.key!] = curr;
				return prev;
			}, {} as Row<FilteredTableDefinition<D, C>>)
		})
	}
}

export class InserObject<D extends TableDefinition, C extends Column<D, ColumnKey<D>>[]> {

	constructor(private sql: Bun.SQL, private table: Table<D>, private columns: C) { }

	async run(...values: Row<FilteredTableDefinition<D, C>>[]) {
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

		await this.sql`INSERT INTO ${sql(this.table.definition.name)} ${sql(insertValues, ...this.columns.map(col => col?.column))}`

		return true;
	}
}