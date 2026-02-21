
-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
CREATE TABLE users (
	id			UUID			UNIQUE NOT NULL DEFAULT gen_random_uuid(),
	username	TEXT 			NOT NULL,
	password	VARCHAR(256)	NOT NULL,

	PRIMARY KEY(id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
DROP TABLE users;
-- +goose StatementEnd