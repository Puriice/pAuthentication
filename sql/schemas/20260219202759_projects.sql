-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
CREATE TABLE projects (
	id			UUID NOT NULL,
	owner		UUID NOT NULL,
	name		VARCHAR(255) NOT NULL,
	
	created_at	TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at 	TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	PRIMARY KEY (id),
	FOREIGN KEY (owner) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
DROP TABLE projects CASCADE;
-- +goose StatementEnd
