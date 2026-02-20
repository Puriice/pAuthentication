-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
ALTER TABLE user_credentials
ADD COLUMN id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid();

UPDATE user_credentials uc
SET id = u.id
FROM users u
WHERE uc.username = u.username;

ALTER TABLE users
DROP CONSTRAINT username_fk;

ALTER TABLE user_credentials 
DROP CONSTRAINT user_credentials_pkey;

ALTER TABLE user_credentials
ADD CONSTRAINT user_credentials_pkey
PRIMARY KEY (id, username);

ALTER TABLE users
ADD CONSTRAINT id_username_fk
FOREIGN KEY (id, username)
REFERENCES user_credentials(id, username);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
ALTER TABLE users
DROP CONSTRAINT id_username_fk;

ALTER TABLE user_credentials 
DROP CONSTRAINT user_credentials_pkey;

ALTER TABLE user_credentials
ADD PRIMARY KEY (username);

ALTER TABLE users
ADD CONSTRAINT username_fk
FOREIGN KEY (username)
REFERENCES user_credentials(username);

ALTER TABLE user_credentials
DROP COLUMN id;
-- +goose StatementEnd
