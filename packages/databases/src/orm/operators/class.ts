import type { numeric } from "../../../types/operator";

export interface Operation { }

export class NotOperation<T extends Operation> {
	constructor(public operation: T | null) { }
}

export class ComparisonOperation<T extends numeric> implements Operation {
	constructor(public value: T, public readonly operator: string) { }
}

export class BetweenOperation<T extends numeric> implements Operation {
	constructor(public from: T, public to: T) { }
}