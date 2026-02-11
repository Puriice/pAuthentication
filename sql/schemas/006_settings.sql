-- +goose Up
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

-- +goose Down
DROP TABLE settings;