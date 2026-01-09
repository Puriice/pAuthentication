import { LikeOperation } from "./class";

export function like(value: string) {
	return new LikeOperation(value)
}

export function ilike(value: string) {
	return new LikeOperation(value, false)
}