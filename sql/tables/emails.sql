CREATE TABLE Emails (
	Username	VARCHAR(255) NOT NULL,
	PriorityOrder	INT NOT NULL,
	Email		VARCHAR(255) NOT NULL,
	PRIMARY KEY(Username, PriorityOrder),
	UNIQUE(Email),
	FOREIGN KEY(Username) REFERENCES Users(Username) ON DELETE CASCADE
);
