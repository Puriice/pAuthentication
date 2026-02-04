-- +goose Up
CREATE TABLE phones (
	username		VARCHAR(255) NOT NULL,
	priority_order	INT NOT NULL,
	phone_number	VARCHAR(255) NOT NULL,

	create_at     	TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_at  		TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	
	PRIMARY KEY(username, priority_order),
	UNIQUE(phone_number),
	FOREIGN KEY(username) REFERENCES Users(username) ON DELETE CASCADE ON UPDATE CASCADE
);

-- +goose Down
DROP TABLE phones;