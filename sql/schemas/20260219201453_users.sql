-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
CREATE TABLE users (
	id				UUID UNIQUE NOT NULL,
	language_tag	TEXT NOT NULL DEFAULT 'en',
	username		TEXT UNIQUE NOT NULL,
	firstname		TEXT NOT NULL,
	middle			VARCHAR,
	lastname		TEXT,
	nickname		TEXT,
	profile			TEXT,
	picture			TEXT,
	website			TEXT,
	gender			TEXT,
	birthday		DATE,
	zoneinfo		TEXT,
	locale			TEXT,

	created_at		TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at 		TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	
	PRIMARY KEY(id, language_tag)
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
DROP TABLE IF EXISTS users CASCADE;
-- +goose StatementEnd
