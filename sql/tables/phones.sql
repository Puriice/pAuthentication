CREATE TABLE Phones (
	Username	VARCHAR(255),
	PriorityOrder		INT,
	Number		VARCHAR(255),
	PRIMARY KEY(Username, PriorityOrder),
	FOREIGN KEY(Username) REFERENCES Users(Username)
);
