-- +goose Up
CREATE TABLE emails (
	username		VARCHAR(255) NOT NULL,
	priority_order	INT NOT NULL,
	email			VARCHAR(255) NOT NULL,

	create_at     	TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_at 		TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	
	PRIMARY KEY(username, priority_order),
	UNIQUE(email),
	FOREIGN KEY(username) REFERENCES Users(username) ON DELETE CASCADE ON UPDATE CASCADE
);

-- +goose Down
DROP TABLE emails;