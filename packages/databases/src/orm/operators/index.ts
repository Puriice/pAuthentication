import type { Operation } from "../../../types/operator";
import { LikeOperation, NotOperation } from "./class";

export function not<T extends Operation | null>(operation: T): NotOperation<T> {
	return new NotOperation(operation)
}
