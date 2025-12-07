import { sql } from "bun";
import { connection } from "..";
import type { TableDefinition } from "../../types";
import { aliasesTable, allowsTable, emailsTable, keysTable, membersTable, phonesTable, privilegesTable, projectSettingsTable, projectsTable, rolesTable, usersTable } from "../tables";

type Table<D extends TableDefinition> = {
	[definition in keyof D['columns']]: D['columns'][definition]['type']
}

type Tables<D extends TableDefinition> = (Table<D>)[];

type ReducedColumns<D extends TableDefinition> = [
	(keyof D['columns'])[],
	{ [definition in keyof D['columns']]: D['columns'][definition]['name'] }[keyof D['columns']][]
]

type SelectQueryReturn<D extends TableDefinition> = { [definition in keyof D['columns']]: D['columns'][definition]['type'] }[keyof D['columns']][]

function createQueryObject<D extends TableDefinition>(table: D): (where?: string) => Promise<Tables<D>> {
	const entries = Object.entries(table.columns);
	const [keys, values]: ReducedColumns<D> = entries.reduce((prev, [key, value]) => {
		prev[0].push(key)
		prev[1].push(value.name)

		return prev;
	}, [[], []] as ReducedColumns<D>)

	return async (where?: string) => {
		const returns: SelectQueryReturn<D>[] = await connection`SELECT ${values.join(', ')} FROM ${sql(table.name)} ${where ? `WHERE ${sql(where)}` : sql}`

		return returns.map(values => {
			return values.reduce((prev, curr, i) => {
				prev[keys[i]!] = curr;
				return prev;
			}, {} as Table<D>)
		})
	}
}

export const user = createQueryObject(usersTable)

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