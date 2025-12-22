import { sql } from "bun";
import { connection } from "..";
import type { Column, ColumnKey, ColumnMaps, ColumnNames, FilteredTableDefinition, Row, SelectQueryReturn, Table, TableDefinition } from "../../types";
import { aliasesTable, allowsTable, emailsTable, keysTable, membersTable, phonesTable, privilegesTable, projectSettingsTable, projectsTable, rolesTable, usersTable } from "../tables";
import { select } from ".";

type ReducedColumns<D extends TableDefinition> = [
	(keyof D['columns'])[],
	ColumnNames<D>[]
]

function createQueryObject<D extends TableDefinition>(table: D): Table<D> {
	const entries = Object.entries(table.columns);

	const columnsMap: Record<string, Column<D, ColumnKey<D>>> = {}

	const [keys, allColumns]: ReducedColumns<D> = entries.reduce((prev, [key, value]) => {
		prev[0].push(key)
		prev[1].push(value.name)

		columnsMap[key] = {
			key: key,
			column: value.name,
		}

		return prev;
	}, [[], []] as ReducedColumns<D>)

	const query: Table<D> = async <C extends readonly Column<D, ColumnKey<D>>[]>(...columns: C) => {
		if (columns.length > 0) {
			const returns: SelectQueryReturn<FilteredTableDefinition<D, C>>[] = await connection`SELECT ${sql.unsafe(columns.map(col => col.column).join(', '))} FROM ${sql(table.name)} `.values()


			return returns.map(values => {
				return values.reduce((prev, curr, i) => {
					prev[columns[i]?.key!] = curr;
					return prev;
				}, {} as Row<FilteredTableDefinition<D, C>>)
			})
		}

		const returns: SelectQueryReturn<D>[] = await connection`SELECT ${sql.unsafe(allColumns.join(', '))} FROM ${sql(table.name)} `.values()

		return returns.map(values => {
			return values.reduce((prev, curr, i) => {
				prev[keys[i]!] = curr;
				return prev;
			}, {} as Row<D>)
		})
	}

	query.definition = table;

	query.columns = columnsMap as unknown as ColumnMaps<D>

	return query;
}

export const users = createQueryObject(usersTable)

export const emails = createQueryObject(emailsTable)

export const phones = createQueryObject(phonesTable)

export const members = createQueryObject(membersTable)

export const aliases = createQueryObject(aliasesTable)

export const projects = createQueryObject(projectsTable)

export const projectSettings = createQueryObject(projectSettingsTable)

export const roles = createQueryObject(rolesTable)

export const privileges = createQueryObject(privilegesTable)

export const allows = createQueryObject(allowsTable)

export const keys = createQueryObject(keysTable)