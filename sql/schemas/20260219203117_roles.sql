-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
CREATE TABLE roles (
	id				UUID NOT NULL,
	project_id		UUID NOT NULL,
	name			VARCHAR(255) NOT NULL,
	priority_order	INT,
	
	created_at		TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 		TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	PRIMARY KEY(ID),
	UNIQUE(project_id, name),
	FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
DROP TABLE roles CASCADE;
-- +goose StatementEnd
