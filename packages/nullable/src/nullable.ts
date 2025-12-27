export type Nullable<T> = {
  value: () => T | Promise<T>;
};

export function nullable<T>(value: T | Promise<T>): Nullable<T> {
  return {
    value: () => value,
  };
}
