-- +goose Up
CREATE TABLE allows (
	role_id				UUID NOT NULL,
	privilege_id		UUID NOT NULL,
	PRIMARY KEY(role_id, privilege_id),
	FOREIGN KEY(role_id) REFERENCES roles(id),
	FOREIGN KEY(privilege_id) REFERENCES privileges(id)
);

-- +goose Down
DROP TABLE allows;