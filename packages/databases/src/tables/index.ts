import type { TableDefinition } from "../../types";

export class StringArray { }
export class IntegerArray { }
export class BigintArray { }
export class JSONBArray { }

const ReturnType = {
	string: '',
	number: 0,
	bigint: 0n,
	numeric: "0.00",             // NUMERIC / DECIMAL (returned as string)
	boolean: true,
	date: new Date(),
	time: "12:34:56",            // TIME (string)
	timestamp: new Date(),      // TIMESTAMP
	timestamptz: new Date(),    // TIMESTAMP WITH TIME ZONE
	interval: "1 day 02:03:04", // INTERVAL (string)

	// UUID
	uuid: "550e8400-e29b-41d4-a716-446655440000",

	// JSON
	json: {},                   // JSON / JSONB → parsed JS object

	// Binary
	bytea: new Uint8Array(),

	// Arrays
	stringArray: new StringArray(),    // TEXT[]
	numberArray: new IntegerArray(),     // INTEGER[]
	bigintArray: new BigintArray(),      // BIGINT[]
	jsonArray: new JSONBArray(),        // JSONB[]

	// Nullability
	nullable: null              // any nullable column
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
		createAt: {
			name: 'createat',
			type: ReturnType.timestamp
		},
		lastModified: {
			name: 'lastmodified',
			type: ReturnType.timestamp
		}
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

export const testsTable = {
	name: 'tests',
	columns: {
		id: {
			name: 'id',
			type: ReturnType.number
		},
		// Numeric
		smallint: {
			name: 'col_smallint',
			type: ReturnType.number
		},
		integer: {
			name: 'col_integer',
			type: ReturnType.number
		},
		bigint: {
			name: 'col_bigint',
			type: ReturnType.bigint
		},
		numeric: {
			name: 'col_numeric',
			type: ReturnType.numeric
		},
		real: {
			name: 'col_real',
			type: ReturnType.number
		},
		double: {
			name: 'col_double',
			type: ReturnType.number
		},

		// String
		varchar: {
			name: 'col_varchar',
			type: ReturnType.string
		},
		text: {
			name: 'col_text',
			type: ReturnType.string
		},

		// Boolean
		boolean: {
			name: 'col_boolean',
			type: ReturnType.boolean
		},

		// Date / Time
		date: {
			name: 'col_date',
			type: ReturnType.date
		},
		timestamp: {
			name: 'col_timestamp',
			type: ReturnType.timestamp
		},
		timestamptz: {
			name: 'col_timestamp_tz',
			type: ReturnType.timestamptz
		},
		interval: {
			name: 'col_interval',
			type: ReturnType.interval
		},

		// UUID
		uuid: {
			name: 'col_uuid',
			type: ReturnType.uuid
		},

		// JSON
		json: {
			name: 'col_json',
			type: ReturnType.json
		},

		// Binary
		bytea: {
			name: 'col_bytea',
			type: ReturnType.bytea
		},

		// Arrays
		// intArray: {
		// 	name: 'col_int_array',
		// 	type: ReturnType.numberArray
		// },
		textArray: {
			name: 'col_text_array',
			type: ReturnType.stringArray
		},

		null: {
			name: 'col_null_or_number',
			type: ReturnType.number,
			nullable: true
		},

		// Metadata
		createAt: {
			name: 'created_at',
			type: ReturnType.timestamp
		},
		lastModified: {
			name: 'updated_at',
			type: ReturnType.timestamp
		}
	}
} as const satisfies TableDefinition;
