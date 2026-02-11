-- +goose up
CREATE TABLE genders (
	gender	TEXT NOT NULL,
	PRIMARY KEY(gender)
);

INSERT INTO genders VALUES ('male'), ('female'), ('others');

-- +goose down
DROP TABLE genders;