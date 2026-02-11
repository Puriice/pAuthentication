-- +goose Up
CREATE TABLE users (
	id			UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
	username	TEXT UNIQUE NOT NULL,
	password	VARCHAR(256) NOT NULL,
	firstname	TEXT NOT NULL,
	middle		VARCHAR,
	lastname	TEXT,
	nickname	TEXT,
	profile		TEXT,
	picture		TEXT,
	website		TEXT,
	gender		TEXT,
	birthday	DATE,
	zoneinfo	TEXT,
	locale		TEXT,

	created_at	TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at 	TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	
	PRIMARY KEY(id),
	FOREIGN KEY(gender) REFERENCES genders(gender) ON DELETE SET NULL ON UPDATE CASCADE
);

-- +goose Down
DROP TABLE users;