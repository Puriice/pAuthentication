const x = typeof 1

export type Typeof = typeof x;

export interface TableDefinition {
	name: string;
	columns: Record<string, { name: string; type: any }>;
	linkedTables?: Record<string, TableDefinition>;
}

/* --- utility key / name helpers --- */

type ColumnKey<D extends TableDefinition> = keyof D['columns'];

type ColumnNameOf<D extends TableDefinition, K extends ColumnKey<D>> =
	D['columns'][K]['name'];

type ColumnTypeOf<D extends TableDefinition, K extends ColumnKey<D>> =
	D['columns'][K]['type'];



export type ColumnNames<D extends TableDefinition> =
	ColumnNameOf<D, ColumnKey<D>>;

/* --- concrete Column type for a particular column key K --- */

export type Column<
	D extends TableDefinition,
	K extends ColumnKey<D>
> = {
	key: K,
	column: ColumnNameOf<D, K>;
	type: ColumnTypeOf<D, K>
};

/* --- map of column objects for the table (runtime shape) --- */

export type ColumnMaps<D extends TableDefinition> = {
	[K in keyof D['columns']]: Column<D, K>;
};

/* --- Row / Rows --- */

export type Row<D extends TableDefinition> = {
	[K in keyof D['columns']]: D['columns'][K]['type'];
};

export type Rows<D extends TableDefinition> = Row<D>[];

/* --- selected names when you pass an array of Column objects --- */

type SelectedColumnNames<C extends readonly { column: string }[]> =
	C[number]['column'];

/* --- filtered columns (keeps original keys but only those whose .name is in Names) --- */

type FilteredColumns<
	D extends TableDefinition,
	Names extends string
> = {
		[K in keyof D['columns']as D['columns'][K]['name'] extends Names ? K : never]:
		D['columns'][K];
	};

/* --- new TableDefinition that contains only filtered columns --- */

type FilteredTableDefinition<
	D extends TableDefinition,
	C extends readonly Column<D, ColumnKey<D>>[]
> = {
	name: D['name'];
	columns: FilteredColumns<D, SelectedColumnNames<C>>;
	linkedTables?: D['linkedTables'];
};

type SystemColumnNames = 'createAt' | 'lastModified'

type TableDefinitionWithoutSystemColumns<
	D extends TableDefinition
> = {
	name: D['name'];
	columns: ExcludeColumnsByName<D, SystemColumnNames>;
	linkedTables?: D['linkedTables'];
};

/* --- Table interface: no-arg returns full rows, columns list returns filtered rows --- */

export interface Table<D extends TableDefinition> {
	// no-arg: full table
	(): Promise<Rows<D>>;

	// with columns: infer filtered table from passed ColumnForKey entries
	<C extends readonly Column<D, ColumnKey<D>>[]>(
		...columns: C
	): Promise<Rows<FilteredTableDefinition<D, C>>>;

	// runtime helpers
	definition: D;
	columns: ColumnMaps<D>;
}

export type SelectQueryReturn<D extends TableDefinition> = {
	[definition in keyof D['columns']]: D[definition]['columns']['type']
}[keyof D][]