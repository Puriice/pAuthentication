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
			name: 'username',
			type: ReturnType.string
		},
		password: {
			name: 'password',
			type: ReturnType.string
		},
		firstname: {
			name: 'firstname',
			type: ReturnType.string
		},
		lastname: {
			name: 'lastname',
			type: ReturnType.string
		},
		birthday: {
			name: 'birthday',
			type: ReturnType.date
		},
	}
} as const satisfies TableDefinition;

export const emailsTable = {
	name: 'emails',
	columns: {
		username: {
			name: 'username',
			type: ReturnType.string
		},
		order: {
			name: 'priorityorder',
			type: ReturnType.number
		},
		email: {
			name: 'email',
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
			name: 'username',
			type: ReturnType.string
		},
		order: {
			name: 'priorityorder',
			type: ReturnType.number
		},
		number: {
			name: 'number',
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
			name: 'id',
			type: ReturnType.number
		},
		owner: {
			name: 'owner',
			type: ReturnType.string
		},
		name: {
			name: 'name',
			type: ReturnType.string
		},
		createAt: {
			name: 'createat',
			type: ReturnType.timestamp
		},
		lastModified: {
			name: 'lastmodified',
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
			name: 'projectid',
			type: ReturnType.number
		},
		redirectURL: {
			name: 'redirecturl',
			type: ReturnType.string
		},
		credential: {
			name: 'credential',
			type: ReturnType.string
		},
		allowAlias: {
			name: 'allowalias',
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
			name: 'id',
			type: ReturnType.number
		},
		projectID: {
			name: 'projectid',
			type: ReturnType.number
		},
		name: {
			name: 'name',
			type: ReturnType.string
		},
		order: {
			name: 'priorityorder',
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
			name: 'id',
			type: ReturnType.number
		},
		projectID: {
			name: 'projectid',
			type: ReturnType.number
		},
		name: {
			name: 'name',
			type: ReturnType.string
		},
		description: {
			name: 'description',
			type: ReturnType.string
		},
		group: {
			name: 'privilegegroup',
			type: ReturnType.string
		},
		order: {
			name: 'priorityorder',
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
			name: 'roleid',
			type: ReturnType.number
		},
		privilegeID: {
			name: 'privilegeid',
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
			name: 'username',
			type: ReturnType.string
		},
		projectID: {
			name: 'projectid',
			type: ReturnType.number
		},
		roleID: {
			name: 'roleid',
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
			name: 'id',
			type: ReturnType.number
		},
		username: {
			name: 'username',
			type: ReturnType.string
		},
		projectID: {
			name: 'projectid',
			type: ReturnType.number
		},
		alias: {
			name: 'alias',
			type: ReturnType.string
		},
		fullname: {
			name: 'fullname',
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
			name: 'token',
			type: ReturnType.string
		},
		projectID: {
			name: 'projectid',
			type: ReturnType.number
		},
		requester: {
			name: 'requester',
			type: ReturnType.string
		},
		roleID: {
			name: 'roleid',
			type: ReturnType.number
		},
		createAt: {
			name: 'createat',
			type: ReturnType.timestamp
		},
		TTL: {
			name: 'ttl',
			type: ReturnType.number
		}
	}
} as const satisfies TableDefinition