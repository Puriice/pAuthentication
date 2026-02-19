-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
CREATE TABLE user_credentials (
	id			UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
	password	VARCHAR(256) NOT NULL,

	PRIMARY KEY(id)
);

ALTER TABLE users 
ADD CONSTRAINT id_fk
FOREIGN KEY (id)
REFERENCES user_credentials(id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
ALTER TABLE users 
DROP CONSTRAINT id_fk;
DROP TABLE user_credentials;
-- +goose StatementEnd
