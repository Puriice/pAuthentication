import type { numeric } from "../../../types/operator"
import { BetweenOperation, ComparisonOperation } from "./class"

export function greatThan<T extends numeric>(value: T): ComparisonOperation<T> {
	return new ComparisonOperation(value, '>')
}

export function lessThan<T extends numeric>(value: T): ComparisonOperation<T> {
	return new ComparisonOperation(value, '<')
}

export function greatThanOrEqualTo<T extends numeric>(value: T): ComparisonOperation<T> {
	return new ComparisonOperation(value, '>=')
}

export function lessThanOrEqualTo<T extends numeric>(value: T): ComparisonOperation<T> {
	return new ComparisonOperation(value, '<=')
}

export function between<T extends numeric>(from: T, to: T): BetweenOperation<T> {
	return new BetweenOperation(from, to)
}