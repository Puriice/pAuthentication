import { sql } from "bun";
import { combine, pushTemplate, raw } from 'literals'
import type { Column, ColumnKey, FilteredTableDefinition, Row, Rows, SelectQueryReturn, Table, TableDefinition } from "../../types"

type WhereCondition<D extends TableDefinition> = Partial<{
	[C in keyof D['columns']]: D['columns'][C]['type'][]
}>

interface WhereableObject<D extends TableDefinition> {
	condition: WhereCondition<D>[];
}

function where<D extends TableDefinition, W extends WhereableObject<D>>(this: W, condition: WhereCondition<D>): W {
	this.condition.push(condition);
	return this;
}

function craftWhereString<D extends TableDefinition>(conditions: WhereCondition<D>[]) {
	let tagged = raw` WHERE`

	conditions.forEach((condition, i) => {
		tagged = pushTemplate(tagged)` (`

		const conditionEntries = Object.entries(condition)

		conditionEntries.forEach(([key, values]: [string, unknown[]], i: number) => {
			tagged = pushTemplate(tagged)` ${sql.unsafe(key)} IN ${sql(values)}`

			if (conditionEntries[i + 1] != undefined) {
				tagged = pushTemplate(tagged)` AND`
			}
		})

		tagged = pushTemplate(tagged)` )`

		if (i + 1 < conditions.length) {
			tagged = pushTemplate(tagged)` OR`
		}
	})
	return tagged
}

export class SelectObject<D extends TableDefinition> implements WhereableObject<D> {
	public readonly condition: WhereCondition<D>[] = [];
	public readonly where: typeof where<D, SelectObject<D>> = where
	private isForUpdate: boolean = false;

	constructor(private sql: Bun.SQL, private table: Table<D>) { }

	async forUpdate() {
		this.isForUpdate = true;

		return this;
	}

	async run(): Promise<Rows<D> | null>
	async run<C extends readonly Column<D, ColumnKey<D>>[]>(
		...columns: C
	): Promise<Rows<FilteredTableDefinition<D, C>> | null>;
	async run<C extends readonly Column<D, ColumnKey<D>>[]>(...columns: C): Promise<Rows<D> | null> {
		try {
			if (columns.length == 0) {
				columns = Object.values(this.table.columns) as unknown as C
			}

			let tagged = raw`SELECT ${sql.unsafe(columns.map(col => col.column).join(', '))} FROM ${sql(this.table.definition.name)}`

			if (this.condition != null) {
				tagged = combine(tagged, craftWhereString(this.condition))
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
		} catch (e) {
			console.error(e);

			return null;
		}
	}
}

export class InserObject<D extends TableDefinition, C extends Column<D, ColumnKey<D>>[]> {

	constructor(private sql: Bun.SQL, private table: Table<D>, private columns: C) { }

	async run(...values: Row<FilteredTableDefinition<D, C>>[]) {
		if (values.length < 1) return false;

		try {
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
		} catch (e) {
			console.error(e);

			return false;
		}
	}
}

export class DeleteObject<D extends TableDefinition> {
	constructor(private sql: Bun.SQL, private table: Table<D>) { }

	async run(...condition: WhereCondition<D>[]) {
		try {
			if (condition == null) return false;

			let tagged = raw`DELETE FROM ${sql(this.table.definition.name)}`

			tagged = combine(tagged, craftWhereString(condition))

			await this.sql(tagged.strings, ...tagged.values).values();

			return true
		} catch (e) {
			console.error(e);

			return false;
		}
	}
}