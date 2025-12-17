CREATE TABLE Users (
	Username	VARCHAR(255) NOT NULL,
	Password	VARCHAR(256) NOT NULL,
	FirstName	VARCHAR(255),
	LastName	VARCHAR(255),
	Birthday	DATE,
	PRIMARY KEY(Username)
);
