import { ComparisonOperation, NotOperation, type Operation } from "./class";

export function not<T extends Operation>(operation: T | null) {
	return new NotOperation(operation)
}
