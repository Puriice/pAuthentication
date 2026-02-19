-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
CREATE TABLE members (
	user_id		UUID NOT NULL,
	project_id	UUID NOT NULL,
	role_id		UUID NOT NULL,

	created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at 	TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	
	PRIMARY KEY(user_id, project_id),
	FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
	FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
DROP TABLE members;
-- +goose StatementEnd
