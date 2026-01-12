import { Elysia } from "elysia";
import project from "./controllers/project";

const prefix = (prefix: string, elysia: Elysia<any, any, any>) => new Elysia()
	.group(prefix, app => app.use(elysia))

const version = (version: number) => prefix(`/v${version}`,
	new Elysia()
		.decorate('version', version)
		.get('/', ({ version }) => version)
)

const app = new Elysia()
	.use(prefix('/api', version(1)))
	.get("/", () => "Hello Elysia")
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
