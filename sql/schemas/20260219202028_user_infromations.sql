-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
CREATE TABLE user_informations (
	id				UUID	NOT NULL,
	language_tag	TEXT 	NOT NULL DEFAULT 'en',
	firstname		TEXT 	NOT NULL,
	middle			TEXT,
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
	
	PRIMARY KEY(id, language_tag),
	FOREIGN KEY(gender) REFERENCES genders(gender) ON UPDATE CASCADE ON DELETE SET NULL
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
DROP TABLE user_informations;
-- +goose StatementEnd