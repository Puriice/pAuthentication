import type { numeric, Operation } from "../../../types/operator";

export class NotOperation<T extends Operation | null> {
	constructor(public operation: T | null) { }
}

export class ComparisonOperation<T extends numeric> implements Operation {
	constructor(public value: T, public readonly operator: string) { }
}

export class BetweenOperation<T extends numeric> implements Operation {
	constructor(public from: T, public to: T) { }
}

export class LikeOperation implements Operation {
	constructor(public value: string, public caseSensitive: boolean = true) { }
}