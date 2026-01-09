import type { BetweenOperation, ComparisonOperation, LikeOperation, NotOperation } from "../src/orm/operators/class";

type numeric = number | bigint

export interface Operation { }

type NumericOperation<T extends numeric> = ComparisonOperation<T>
	| BetweenOperation<T>

type StringOperation = LikeOperation

type X<T extends number | bigint> =
	{ a: T } | { b: T };
