CREATE TABLE privileges (
	id				BIGINT NOT NULL,
	project_id		UUID NOT NULL,
	name			VARCHAR(255) NOT NULL,
	description		Text,
	privilege_group	VARCHAR(255),
	priority_order	INT,

	create_at	    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_at		TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	
	PRIMARY KEY(id),
	UNIQUE(project_id, name),
	FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
