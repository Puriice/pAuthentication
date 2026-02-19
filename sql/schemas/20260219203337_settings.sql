-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
CREATE TABLE settings (
	project_id		UUID NOT NULL,
	redirect_url	VARCHAR(255),
	credential		VARCHAR(255),
	allow_alias		BOOLEAN DEFAULT TRUE,

	created_at		TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at		TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	
	PRIMARY KEY(project_id),
	FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
DROP TABLE settings;
-- +goose StatementEnd
