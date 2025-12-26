import { describe, it, expect } from "bun:test";
import { raw, pushTemplate, combine } from "../src/index"; // adjust path as needed

describe("raw()", () => {
	it("should return a template with correct strings and values", () => {
		const value = 42;
		const tpl = raw`Hello ${value} World`;

		expect(tpl.values).toEqual([42]);
		expect(tpl.strings.raw).toEqual(["Hello ", " World"]);
	});

	it("should correctly stringify the template", () => {
		const name = "Alice";
		const age = 30;

		const tpl = raw`Name: ${name}, Age: ${age}`;
		expect(tpl.toString()).toBe("Name: Alice, Age: 30");
	});

	it("should handle templates without interpolations", () => {
		const tpl = raw`Just text`;

		expect(tpl.values).toEqual([]);
		expect(tpl.toString()).toBe("Just text");
	});

	it("should stringify undefined and null values explicitly", () => {
		const tpl = raw`U:${undefined}, N:${null}`;

		expect(tpl.values).toEqual([undefined, null]);
		expect(tpl.toString()).toBe("U:undefined, N:null");
	});

	it("should handle boolean and number values correctly", () => {
		const tpl = raw`Bool:${false}, Num:${0}`;

		expect(tpl.toString()).toBe("Bool:false, Num:0");
	});

	it("should preserve empty string segments", () => {
		const tpl = raw`${"A"}${"B"}${"C"}`;

		expect(tpl.values).toEqual(["A", "B", "C"]);
		expect(tpl.toString()).toBe("ABC");
	});

	it("should handle an entirely empty template", () => {
		const tpl = raw``;

		expect(tpl.values).toEqual([]);
		expect(tpl.strings.raw).toEqual([""]);
		expect(tpl.toString()).toBe("");
	});
});

describe("pushTemplate()", () => {
	it("should append a new template to an existing one", () => {
		const base = raw`Hello ${"World"}`;
		const push = pushTemplate(base);

		const result = push`! Number: ${123}`;

		expect(result.values).toEqual(["World", 123]);
		expect(result.toString()).toBe("Hello World! Number: 123");
	});

	it("should correctly merge raw string segments", () => {
		const base = raw`A${1}B`;
		const push = pushTemplate(base);

		const result = push`C${2}D`;

		expect(result.values).toEqual([1, 2]);
		expect(result.toString()).toBe("A1BC2D");
	});

	it("should work when the base template has no values", () => {
		const base = raw`Start`;
		const push = pushTemplate(base);

		const result = push` End ${true}`;

		expect(result.values).toEqual([true]);
		expect(result.toString()).toBe("Start End true");
	});

	it("should correctly push onto an empty base template", () => {
		const base = raw``;
		const push = pushTemplate(base);

		const result = push`X${1}Y`;

		expect(result.values).toEqual([1]);
		expect(result.toString()).toBe("X1Y");
	});

	it("should handle pushing a template with no values", () => {
		const base = raw`Hello ${"World"}`;
		const push = pushTemplate(base);

		const result = push`!!!`;

		expect(result.values).toEqual(["World"]);
		expect(result.toString()).toBe("Hello World!!!");
	});

	it("should preserve order when pushing multiple times", () => {
		const base = raw`A${1}`;
		const push1 = pushTemplate(base);
		const mid = push1`B${2}`;

		const push2 = pushTemplate(mid);
		const result = push2`C${3}`;

		expect(result.values).toEqual([1, 2, 3]);
		expect(result.toString()).toBe("A1B2C3");
	});

	it("should not insert extra text when the previous raw string ends empty", () => {
		const base = raw`${1}`;
		const push = pushTemplate(base);

		const result = push`${2}`;

		expect(result.values).toEqual([1, 2]);
		expect(result.toString()).toBe("12");
	});
});

describe("combine()", () => {
	it("should merge two templates in order", () => {
		const t1 = raw`Hello ${"World"}`;
		const t2 = raw`! Number: ${42}`;

		const result = combine(t1, t2);

		expect(result.values).toEqual(["World", 42]);
		expect(result.toString()).toBe("Hello World! Number: 42");
	});

	it("should correctly merge raw segments without values in the second template", () => {
		const t1 = raw`A${1}B`;
		const t2 = raw`C`;

		const result = combine(t1, t2);

		expect(result.values).toEqual([1]);
		expect(result.toString()).toBe("A1BC");
	});

	it("should correctly merge raw segments without values in the first template", () => {
		const t1 = raw`Start`;
		const t2 = raw` ${"End"}`;

		const result = combine(t1, t2);

		expect(result.values).toEqual(["End"]);
		expect(result.toString()).toBe("Start End");
	});

	it("should preserveᴬppend templates when both have multiple interpolations", () => {
		const t1 = raw`X${1}Y${2}`;
		const t2 = raw`Z${3}W${4}`;

		const result = combine(t1, t2);

		expect(result.values).toEqual([1, 2, 3, 4]);
		expect(result.toString()).toBe("X1Y2Z3W4");
	});

	it("should handle combining with an empty second template", () => {
		const t1 = raw`Only ${"One"}`;
		const t2 = raw``;

		const result = combine(t1, t2);

		expect(result.values).toEqual(["One"]);
		expect(result.toString()).toBe("Only One");
	});

	it("should handle combining with an empty first template", () => {
		const t1 = raw``;
		const t2 = raw`Value: ${99}`;

		const result = combine(t1, t2);

		expect(result.values).toEqual([99]);
		expect(result.toString()).toBe("Value: 99");
	});

	it("should preserve order when combining repeatedly", () => {
		const t1 = raw`A${1}`;
		const t2 = raw`B${2}`;
		const t3 = raw`C${3}`;

		const result = combine(combine(t1, t2), t3);

		expect(result.values).toEqual([1, 2, 3]);
		expect(result.toString()).toBe("A1B2C3");
	});
});
