import { nullable, runIf } from "@workspace/nullable";

const result = runIf(
  nullable("x"),
  nullable(2),
  (a, b) => `${a}-${b}`
);

console.log(await result.value());
