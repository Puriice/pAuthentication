-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
CREATE TABLE genders (
	gender	TEXT NOT NULL,
	PRIMARY KEY(gender)
);

INSERT INTO genders VALUES ('male'), ('female'), ('others');

ALTER TABLE users 
ADD CONSTRAINT gender_fk
FOREIGN KEY (gender)
REFERENCES genders(gender) ON UPDATE CASCADE ON DELETE SET NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';

ALTER TABLE users
DROP CONSTRAINT gender_fk;

DROP TABLE genders;

-- +goose StatementEnd
