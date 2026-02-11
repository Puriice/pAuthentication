-- +goose up
CREATE TABLE address (
	user_id				UUID NOT NULL,
	street_address		TEXT,
	locality			TEXT,
	region				TEXT,
	postal_code			TEXT,
	country				TEXT,

	PRIMARY KEY(user_id),
	FOREIGN KEY(user_id) REFERENCES users(id)
);
-- +goose down
DROP TABLE address;