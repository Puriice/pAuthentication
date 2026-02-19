-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
CREATE TABLE phones (
	user_id			UUID NOT NULL,
	priority_order	INT NOT NULL,
	phone_number	TEXT NOT NULL,
	verified		TEXT DEFAULT FALSE,

	created_at     	TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  		TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	
	PRIMARY KEY(user_id, priority_order),
	UNIQUE(phone_number),
	FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
DROP TABLE phones;
-- +goose StatementEnd
