const x = typeof 1

export type Typeof = typeof x;

export interface TableDefinition {
	name: string;
	columns: Record<string, { name: string, type: any }>
	linkedTables?: Record<string, TableDefinition>,
}