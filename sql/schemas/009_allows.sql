CREATE TABLE allows (
	role_id				BIGINT NOT NULL,
	privilege_id		BIGINT NOT NULL,
	PRIMARY KEY(role_id, privilege_id),
	FOREIGN KEY(role_id) REFERENCES roles(id),
	FOREIGN KEY(privilege_id) REFERENCES privileges(id)
);