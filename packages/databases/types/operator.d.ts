import type { ComparisonOperation } from "../src/orm/operators/numeric";

type numeric = number | bigint

interface Operator {
	operator: readonly string;
}

interface ComparisonOperation<T extends numeric> extends Operator {
	value: T
}

interface BetweenOperation<T extends numeric> extends Operator {
	from: T;
	to: T;
}

type NumericOperation<T extends numeric> = ComparisonOperation<T>
	| BetweenOperation<T>