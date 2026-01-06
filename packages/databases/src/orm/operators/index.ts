import { NotOperation, type Operation } from "./class";

export function not<T extends Operation>(operation: T) {
	return new NotOperation(operation)
}