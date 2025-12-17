CREATE TABLE Privileges (
	ID		BIGINT NOT NULL,
	ProjectID	BIGINT NOT NULL,
	Name		VARCHAR(255) NOT NULL,
	Description	Text,
	PrivilegeGroup	VARCHAR(255),
	PriorityOrder	INT,
	PRIMARY KEY(ID),
	UNIQUE(ProjectID, Name),
	FOREIGN KEY(ProjectID) REFERENCES Projects(ID) ON DELETE CASCADE
);
