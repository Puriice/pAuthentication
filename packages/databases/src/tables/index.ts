import type { TableDefinition } from "../../types";

const ReturnType = {
	string: '',
	number: 0,
	boolean: true,
	date: new Date(),
	timestamp: new Date()
}

export const usersTable = {
	name: 'users',
	columns: {
		username: {
			name: 'Username',
			type: ReturnType.string
		},
		password: {
			name: 'Password',
			type: ReturnType.string
		},
		firstname: {
			name: 'Firstname',
			type: ReturnType.string
		},
		lastname: {
			name: 'Lastname',
			type: ReturnType.string
		},
		birthday: {
			name: 'Birthday',
			type: ReturnType.date
		},
	}
} as const satisfies TableDefinition;

export const emailsTable = {
	name: 'emails',
	columns: {
		username: {
			name: 'Username',
			type: ReturnType.string
		},
		order: {
			name: 'PriorityOrder',
			type: ReturnType.number
		},
		email: {
			name: 'Email',
			type: ReturnType.string
		}
	},
	linkedTables: {
		users: usersTable
	}
} as const satisfies TableDefinition

export const phonesTable = {
	name: 'phones',
	columns: {
		username: {
			name: 'Username',
			type: ReturnType.string
		},
		order: {
			name: 'PriorityOrder',
			type: ReturnType.number
		},
		number: {
			name: 'Number',
			type: ReturnType.string
		}
	},
	linkedTables: {
		users: usersTable
	}
} as const satisfies TableDefinition

export const projectsTable = {
	name: 'projects',
	columns: {
		id: {
			name: 'ID',
			type: ReturnType.number
		},
		owner: {
			name: 'Owner',
			type: ReturnType.string
		},
		name: {
			name: 'Name',
			type: ReturnType.string
		},
		createAt: {
			name: 'CreateAt',
			type: ReturnType.timestamp
		},
		lastModified: {
			name: 'LastModified',
			type: ReturnType.timestamp
		}
	},
	linkedTables: {
		users: usersTable
	}
} as const satisfies TableDefinition

export const projectSettingsTable = {
	name: 'settings',
	columns: {
		id: {
			name: 'ProjectID',
			type: ReturnType.number
		},
		redirectURL: {
			name: 'RedirectURL',
			type: ReturnType.string
		},
		credential: {
			name: 'Credential',
			type: ReturnType.string
		},
		allowAlias: {
			name: 'AllowAlias',
			type: ReturnType.boolean
		}
	},
	linkedTables: {
		projects: projectsTable
	}
} as const satisfies TableDefinition

export const rolesTable = {
	name: 'roles',
	columns: {
		id: {
			name: 'ID',
			type: ReturnType.number
		},
		projectID: {
			name: 'ProjectID',
			type: ReturnType.number
		},
		name: {
			name: 'Name',
			type: ReturnType.string
		},
		order: {
			name: 'PriorityOrder',
			type: ReturnType.number
		}
	},
	linkedTables: {
		projects: projectsTable
	}
} as const satisfies TableDefinition

export const privilegesTable = {
	name: 'privileges',
	columns: {
		id: {
			name: 'ID',
			type: ReturnType.number
		},
		projectID: {
			name: 'ProjectID',
			type: ReturnType.number
		},
		name: {
			name: 'Name',
			type: ReturnType.string
		},
		description: {
			name: 'Description',
			type: ReturnType.string
		},
		group: {
			name: 'PrivilegeGroup',
			type: ReturnType.string
		},
		order: {
			name: 'PriorityOrder',
			type: ReturnType.number
		}
	},
	linkedTables: {
		projects: projectsTable
	}
} as const satisfies TableDefinition

export const allowsTable = {
	name: 'allows',
	columns: {
		roleID: {
			name: 'RoleID',
			type: ReturnType.number
		},
		privilegeID: {
			name: 'PrivilegeID',
			type: ReturnType.number
		},
	},
	linkedTables: {
		roles: rolesTable,
		privileges: privilegesTable
	}
} as const satisfies TableDefinition

export const membersTable = {
	name: 'members',
	columns: {
		username: {
			name: 'Username',
			type: ReturnType.string
		},
		projectID: {
			name: 'ProjectID',
			type: ReturnType.number
		},
		roleID: {
			name: 'RoleID',
			type: ReturnType.number
		}
	},
	linkedTables: {
		users: usersTable,
		projects: projectsTable,
		roles: rolesTable
	}
} as const satisfies TableDefinition

export const aliasesTable = {
	name: 'aliases',
	columns: {
		id: {
			name: 'ID',
			type: ReturnType.number
		},
		username: {
			name: 'Username',
			type: ReturnType.string
		},
		projectID: {
			name: 'ProjectID',
			type: ReturnType.number
		},
		alias: {
			name: 'Alias',
			type: ReturnType.string
		},
		fullname: {
			name: 'FullName',
			type: ReturnType.string
		}
	},
	linkedTables: {
		users: usersTable,
		projects: projectsTable
	}
} as const satisfies TableDefinition

export const keysTable = {
	name: 'apikeys',
	columns: {
		token: {
			name: 'Token',
			type: ReturnType.string
		},
		projectID: {
			name: 'ProjectID',
			type: ReturnType.number
		},
		requester: {
			name: 'Requester',
			type: ReturnType.string
		},
		roleID: {
			name: 'RoleID',
			type: ReturnType.number
		},
		createAt: {
			name: 'CreateAt',
			type: ReturnType.timestamp
		},
		TTL: {
			name: 'TTL',
			type: ReturnType.number
		}
	}
} as const satisfies TableDefinition