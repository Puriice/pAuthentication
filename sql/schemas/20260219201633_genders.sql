-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
CREATE TABLE genders (
	gender	TEXT NOT NULL,
	PRIMARY KEY(gender)
);

INSERT INTO genders VALUES ('male'), ('female'), ('others');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
DROP TABLE genders;

-- +goose StatementEnd
