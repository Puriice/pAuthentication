import { nullable, runIf } from "./index";

async function main() {
  const result = await runIf(
    nullable("a"),
    nullable(1),
    nullable(true),
    (a, b, c) => `${a}-${b}-${c}`
  );

  console.log(await result.value());
}

main();
