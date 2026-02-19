-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
ALTER TABLE user_credentials
ADD COLUMN username TEXT UNIQUE NOT NULL;

UPDATE user_credentials uc
SET username = u.username
FROM users u
WHERE uc.id = u.id;

ALTER TABLE users 
DROP CONSTRAINT id_fk;

ALTER TABLE user_credentials
DROP COLUMN id;

ALTER TABLE users
ADD CONSTRAINT username_fk
FOREIGN KEY (username)
REFERENCES user_credentials(username)
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';

ALTER TABLE user_credentials
ADD COLUMN id;

UPDATE user_credentials uc
SET id = u.id
FROM users u
WHERE uc.username = u.username;

ALTER TABLE users 
ADD CONSTRAINT id_fk
FOREIGN KEY (id)
REFERENCES user_credentials(id);

ALTER TABLE users
DROP CONSTRAINT username_fk

ALTER TABLE user_credentials
DROP COLUMN username;


-- +goose StatementEnd
