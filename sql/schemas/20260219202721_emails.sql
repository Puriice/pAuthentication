-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
CREATE TABLE emails (
	user_id			UUID NOT NULL,
	priority_order	INT NOT NULL,
	email			TEXT NOT NULL,
	verified		BOOL DEFAULT FALSE,

	created_at     	TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at 		TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	
	PRIMARY KEY(user_id, priority_order),
	UNIQUE(email),
	FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
DROP TABLE emails;
-- +goose StatementEnd
