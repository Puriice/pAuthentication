import Elysia from "elysia";
import { select } from 'databases/orm'
import { projects } from "databases/tables";

const project = new Elysia()
	.group(
		'/projects',
		(app) => app
			.get('/', async () => {
				return select(projects).run()
			})
	)

export default project;