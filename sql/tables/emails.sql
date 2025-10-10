CREATE TABLE Emails (
	Username	VARCHAR(255),
	PriorityOrder	INT,
	Email		VARCHAR(255),
	PRIMARY KEY(Username, PriorityOrder),
	FOREIGN KEY(Username) REFERENCES Users(Username)
);
