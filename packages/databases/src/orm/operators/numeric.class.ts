import type { numeric } from "../../../types/operator";

export class ComparisonOperation<T extends numeric> {
	constructor(public value: T, public readonly operator: string) { }
}

export class BetweenOperation<T extends numeric> {
	constructor(public from: T, public to: T) { }
}