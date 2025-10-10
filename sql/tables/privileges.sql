CREATE TABLE Privileges (
	ID		BIGINT,
	ProjectID	BIGINT,
	Name		VARCHAR(255),
	Description	Text,
	PrivilegeGroup	VARCHAR(255),
	PriorityOrder	INT,
	PRIMARY KEY(ID),
	FOREIGN KEY(ProjectID) REFERENCES Projects(ID)
);
