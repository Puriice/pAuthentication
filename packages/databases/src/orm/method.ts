import { sql } from "bun";
import { combine, pushTemplate, raw } from 'literals'
import type { Column, ColumnKey, FilteredTableDefinition, Row, Rows, SelectQueryReturn, Table, TableDefinition } from "../../types"

type WhereCondition<D extends TableDefinition> = Partial<{
	[C in keyof D['columns']]: D['columns'][C]['type'][] | D['columns'][C]['type']
}>

interface WhereableObject<D extends TableDefinition> {
	readonly conditions: WhereCondition<D>[];
	readonly where: typeof where<D, this>;
}

function where<D extends TableDefinition, W extends WhereableObject<D>>(this: W, condition: WhereCondition<D>): W {
	this.conditions.push(condition);
	return this;
}

interface DangerOperation {
	isDanger: boolean;
	readonly danger: typeof danger<this>;
	readonly safe: typeof safe<this>;
}

function safe<D extends DangerOperation>(this: D): D {
	this.isDanger = false;
	return this;
}

function danger<D extends DangerOperation>(this: D): D {
	this.isDanger = true;
	return this;
}

function craftWhereString<D extends TableDefinition>(conditions: WhereCondition<D>[]) {
	let tagged = raw` WHERE`

	conditions.forEach((condition, i) => {

		const conditionEntries = Object.entries(condition)

		if (conditionEntries.length == 0) return;

		if (i > 0) {
			tagged = pushTemplate(tagged)` OR`
		}

		tagged = pushTemplate(tagged)` (`

		conditionEntries.forEach(([key, values]: [string, unknown[] | unknown], i: number) => {
			if (Array.isArray(values)) {
				tagged = pushTemplate(tagged)` ${sql.unsafe(key)} IN ${sql(values)}`
			} else {
				tagged = pushTemplate(tagged)` ${sql.unsafe(key)} = ${values}`
			}

			if (conditionEntries[i + 1] != undefined) {
				tagged = pushTemplate(tagged)` AND`
			}
		})

		tagged = pushTemplate(tagged)` )`
	})

	if (tagged.toString() == ' WHERE') return raw``;

	return tagged
}

interface LimitAndOffset {
	limit: number;
	offset: number;
}

interface Pagination {
	page: number;
	length?: number;
}

const DEFAULT_PAGINATION_LENGTH = 10;

export class SelectObject<D extends TableDefinition> implements WhereableObject<D> {
	public readonly conditions: WhereCondition<D>[] = [];
	public readonly where: (this: this, condition: WhereCondition<D>) => this = where;

	private isForUpdate: boolean = false;
	private _limit: number = 0;
	private _offset: number = 0;

	constructor(private sql: Bun.SQL, private table: Table<D>) { }

	public forUpdate() {
		this.isForUpdate = true;

		return this;
	}

	// public page(options: Pagination): this
	// public page(options: LimitAndOffset): this
	public page(options: LimitAndOffset | Pagination): this {
		if ("page" in options) {
			if (options.length == undefined) {
				options.length = DEFAULT_PAGINATION_LENGTH;
			}

			this._limit = options.length;
			this._offset = Math.max(options.page - 1, 1) * options.length;
		} else {
			this._limit = options.limit;
			this._offset = options.offset;
		}

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

			if (this.conditions != null && this.conditions.length > 0) {
				tagged = combine(tagged, craftWhereString(this.conditions))
			}

			if (this._limit > 0) {
				tagged = pushTemplate(tagged)` LIMIT ${this._limit}`

				if (this._offset > 0) {
					tagged = pushTemplate(tagged)` OFFSET ${this._offset}`
				}
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

export class UpdateObject<D extends TableDefinition, C extends Column<D, ColumnKey<D>>[]> implements WhereableObject<D>, DangerOperation {
	public readonly conditions: WhereCondition<D>[] = [];
	public readonly where: (this: this, condition: WhereCondition<D>) => this = where

	public readonly isDanger: boolean = false;
	public readonly danger: (this: this) => this = danger;
	public readonly safe: (this: this) => this = safe;

	constructor(private sql: Bun.SQL, private table: Table<D>, private columns: C) { };

	async run(...values: Row<FilteredTableDefinition<D, C>>[]) {
		if (values.length == 0) return;

		try {
			const updateValues = values.map(value => {
				return Object.entries(value).reduce((prev, [key, value]) => {
					if (value instanceof Date) {
						value = value.toISOString().slice(0, 10)
					}

					prev[key] = value;

					return prev;
				}, {} as Record<string, unknown>)
			})


			let tagged = raw`UPDATE ${sql(this.table.definition.name)} SET ${sql(updateValues, ...this.columns.map(col => col?.column))}`

			const whereString = craftWhereString(this.conditions);

			if (whereString.toString() != '') {
				tagged = combine(tagged, whereString)
			} else if (!this.isDanger) {
				console.warn(`Empty WHERE clause is detected. To continue please run with DeleteObject#danger to allow empty where clause.`)
				return false;
			}

			await this.sql(tagged.strings, ...tagged.values).values();

			return true;
		} catch (e) {
			console.error(e);

			return false;
		}
	}
}

export class DeleteObject<D extends TableDefinition> implements DangerOperation {
	public readonly isDanger: boolean = false;
	public readonly danger: (this: this) => this = danger;
	public readonly safe: (this: this) => this = safe;

	constructor(private sql: Bun.SQL, private table: Table<D>) { }


	async run(...condition: WhereCondition<D>[]) {
		try {
			let tagged = raw`DELETE FROM ${sql(this.table.definition.name)}`

			const whereString = craftWhereString(condition)

			if (whereString.toString() != '') {
				tagged = combine(tagged, whereString)
			} else if (!this.isDanger) {
				console.warn(`Empty WHERE clause is detected. To continue please run with DeleteObject#danger to allow empty where clause.`)
				return false;
			}

			await this.sql(tagged.strings, ...tagged.values).values();

			return true
		} catch (e) {
			console.error(e);

			return false;
		}
	}
}