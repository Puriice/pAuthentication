import { Elysia } from "elysia";
import project from "./controllers/project";

const app = new Elysia()
	.use(project)
	.get("/", () => "Hello Elysia")
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
