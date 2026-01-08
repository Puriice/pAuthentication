import { describe, it, expect } from "bun:test";
import { nullable, runIf } from "../src";

describe("runIf", () => {
  it("should run transformer when all values exist", async () => {
    const result = runIf(
      nullable("a"),
      nullable(1),
      nullable(true),
      (a, b, c) => `${a}-${b}-${c}`
    );

    expect(await result.value()).toBe("a-1-true");
  });

  it("should return null when some value is null", async () => {
    const result = runIf(
      nullable("a"),
      nullable(null),
      nullable(true),
      (a, b, c) => `${a}-${b}-${c}`
    );

    expect(await result.value()).toBeNull();
  });
});
