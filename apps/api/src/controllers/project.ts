import Elysia from "elysia";

const project = new Elysia()
	.group(
		'/projects',
		(app) => app
	)

export default project;