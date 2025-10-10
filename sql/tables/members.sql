CREATE TABLE Members (
	Username	VARCHAR(255),
	ProjectID	BIGINT,
	RoleID		BIGINT,
	PRIMARY KEY(Username, ProjectID, RoleID),
	FOREIGN KEY(Username) REFERENCES Users(Username),
	FOREIGN KEY(ProjectID) REFERENCES Projects(ID),
	FOREIGN KEY(RoleID) REFERENCES Roles(ID)
);
