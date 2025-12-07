CREATE TABLE Allows (
	RoleID				BIGINT,
	PrivilegeID			BIGINT,
	PRIMARY KEY(RoleID, PrivilegeID),
	FOREIGN KEY(RoleID) REFERENCES Roles(ID),
	FOREIGN KEY(PrivilegeID) REFERENCES Privileges(ID)
);