-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
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
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
DROP TABLE address;
-- +goose StatementEnd
