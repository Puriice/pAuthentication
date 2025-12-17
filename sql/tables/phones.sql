CREATE TABLE Phones (
	Username	VARCHAR(255) NOT NULL,
	PriorityOrder		INT NOT NULL,
	Number		VARCHAR(255) NOT NULL,
	PRIMARY KEY(Username, PriorityOrder),
	UNIQUE(Number),
	FOREIGN KEY(Username) REFERENCES Users(Username) ON DELETE CASCADE
);
