import { SQL, sql } from "bun";
import { connection } from "..";
import type { TableDefinition } from "../../types";
import { aliasesTable, allowsTable, emailsTable, keysTable, membersTable, phonesTable, privilegesTable, projectSettingsTable, projectsTable, rolesTable, usersTable } from "../tables";

type Table<D extends TableDefinition> = {
	[definition in keyof D['columns']]: D['columns'][definition]['type']
}

type Tables<D extends TableDefinition> = (Table<D>)[];

type ColumnNames<D extends TableDefinition> = { [definition in keyof D['columns']]: D['columns'][definition]['name'] }[keyof D['columns']]

type ReducedColumns<D extends TableDefinition> = [
	(keyof D['columns'])[],
	ColumnNames<D>[]
]

type SelectQueryReturn<D extends TableDefinition> = { [definition in keyof D['columns']]: D['columns'][definition]['type'] }[keyof D['columns']][]

interface QueryObject<D extends TableDefinition> {
	(where?: string): Promise<Tables<D>>
	definition: TableDefinition;
	insert: (values: Tables<D>, ...columns: ColumnNames<D>[]) => Promise<void>
}

function createQueryObject<D extends TableDefinition>(table: D): QueryObject<D> {
	const entries = Object.entries(table.columns);
	const [keys, columns]: ReducedColumns<D> = entries.reduce((prev, [key, value]) => {
		prev[0].push(key)
		prev[1].push(value.name)

		return prev;
	}, [[], []] as ReducedColumns<D>)

	const query: QueryObject<D> = async (where?: string) => {
		const whereFilter = sql`${where}`
		const returns: SelectQueryReturn<D>[] = where
			? await connection`SELECT ${sql.unsafe(columns.join(', '))} FROM ${sql(table.name)} `.values()
			: await connection`SELECT ${sql.unsafe(columns.join(', '))} FROM ${sql(table.name)} WHERE ${whereFilter}`.values()

		return returns.map(values => {
			return values.reduce((prev, curr, i) => {
				prev[keys[i]!] = curr;
				return prev;
			}, {} as Table<D>)
		})
	}

	query.definition = table;

	query.insert = async function (tables, ...columns) {
		const values = await sql`INSERT INTO ${sql(this.definition.name)} ${sql(tables, ...columns)}`
	}

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