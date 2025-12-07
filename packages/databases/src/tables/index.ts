export interface TableDefinition {
	name: string;
	columns: Record<string, string>
	linkedTables?: Record<string, TableDefinition>
}


export const users = {
	name: 'Users',
	columns: {
		username: 'Username',
		password: 'Password',
		firstname: 'Firstname',
		lastname: 'Lastname',
		birthday: 'Birthday',
	}
} as const satisfies TableDefinition;

export const emails = {
	name: 'Emails',
	columns: {
		username: 'Username',
		order: 'Order',
		email: 'Email'
	},
	linkedTables: {
		users
	}
} as const satisfies TableDefinition

export const phones = {
	name: 'Phones',
	columns: {
		username: 'Username',
		order: 'Order',
		email: 'Number'
	},
	linkedTables: {
		users
	}
} as const satisfies TableDefinition

export const projects = {
	name: 'Projects',
	columns: {
		id: 'ID',
		owner: 'Owner',
		name: 'Name',
		createAt: 'CreateAt',
	},
	linkedTables: {
		users
	}
} as const satisfies TableDefinition

export const projectSettings = {
	name: 'Settings',
	columns: {
		id: 'ProjectID',
		redirectURL: 'RedirectURL',
		credential: 'Credential',
		allowAlias: 'AllowAlias'
	},
	linkedTables: {
		projects
	}
} as const satisfies TableDefinition

export const roles = {
	name: 'Roles',
	columns: {
		id: 'ID',
		projectID: 'ProjectID',
		name: 'Name',
		order: 'Order'
	},
	linkedTables: {
		projects
	}
} as const satisfies TableDefinition

export const privileges = {
	name: 'Privileges',
	columns: {
		id: 'ID',
		projectID: 'ProjectID',
		name: 'Name',
		description: 'Description',
		group: 'Group',
		order: 'Order'
	},
	linkedTables: {
		projects
	}
} as const satisfies TableDefinition

export const allows = {
	name: 'Allows',
	columns: {
		roleID: 'RoleID',
		privilegeID: 'PrivilegeID',
	},
	linkedTables: {
		roles,
		privileges
	}
} as const satisfies TableDefinition

export const members = {
	name: 'Members',
	columns: {
		username: 'Username',
		projectID: 'ProjectID',
		roleID: 'RoleID'
	},
	linkedTables: {
		users,
		projects,
		roles
	}
} as const satisfies TableDefinition

export const aliases = {
	name: 'Aliases',
	columns: {
		id: 'ID',
		username: 'Username',
		projectID: 'ProjectID',
		alias: 'Alias',
		fullname: 'FullName'
	},
	linkedTables: {
		users,
		projects
	}
} as const satisfies TableDefinition

export const keys = {
	name: 'API Keys',
	columns: {
		token: 'Token',
		projectID: 'ProjectID',
		requester: 'Requester',
		roleID: 'RoleID',
		createAt: 'CreateAt',
		TTL: 'TTL'
	}
} as const satisfies TableDefinition