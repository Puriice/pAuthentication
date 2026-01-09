export interface MutableTemplateStringArray extends Array<string> {
	raw: string[]
}

export interface Template {
	strings: TemplateStringsArray;
	values: unknown[];
	toString(): string;
}