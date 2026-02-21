-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
CREATE TABLE identifiers (
	user_id			UUID	NOT NULL,
	client_id		UUID	NOT NULL, 
	subject_claim	UUID	UNIQUE NOT NULL DEFAULT gen_random_uuid(),

	PRIMARY KEY (user_id, client_id),
	FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
DROP TABLE identifiers;
-- +goose StatementEnd
