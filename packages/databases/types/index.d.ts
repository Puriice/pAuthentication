const x = typeof 1

export type Typeof = typeof x;

export interface TableDefinition {
	name: string;
	columns: Record<string, { name: string, type: any }>
	linkedTables?: Record<string, TableDefinition>,
}

export type Row<D extends TableDefinition> = {
	[definition in keyof D['columns']]: D['columns'][definition]['type']
}

export type Rows<D extends TableDefinition> = (Row<D>)[];

export type ColumnNames<D extends TableDefinition> = { [definition in keyof D['columns']]: D['columns'][definition]['name'] }[keyof D['columns']]

export type SelectQueryReturn<D extends TableDefinition> = { [definition in keyof D['columns']]: D['columns'][definition]['type'] }[keyof D['columns']][]

export interface Columns<D extends TableDefinition> {
	column: ColumnNames<D>
}

export interface Table<D extends TableDefinition> {
	(): Promise<Rows<D>>
	definition: TableDefinition;
	column(name: ColumnNames<D>): Columns<D>
}
