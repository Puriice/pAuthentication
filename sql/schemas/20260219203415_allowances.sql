-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
CREATE TABLE allows (
	role_id				UUID NOT NULL,
	privilege_id		UUID NOT NULL,
	PRIMARY KEY(role_id, privilege_id),
	FOREIGN KEY(role_id) REFERENCES roles(id),
	FOREIGN KEY(privilege_id) REFERENCES privileges(id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
DROP TABLE allows;
-- +goose StatementEnd
