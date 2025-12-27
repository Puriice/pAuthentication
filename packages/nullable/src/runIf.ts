import type { Nullable } from "./nullable";

type UnwrapNullable<T> = T extends Nullable<infer U> ? U : never;
type UnwrapAll<T extends readonly Nullable<any>[]> = {
  [K in keyof T]: UnwrapNullable<T[K]>;
};

export async function runIf<
  T extends readonly Nullable<any>[],
  R
>(
  ...args: [...T, (...values: UnwrapAll<T>) => R | Promise<R>]
): Promise<Nullable<R>> {
  const transformer = args[args.length - 1] as any;
  const wrappers = args.slice(0, -1) as unknown as T;

  const values = await Promise.all(
    wrappers.map(w => w.value())
  );

  if (values.some(v => v === null || v === undefined)) {
    return { value: () => null as any };
  }

  const result = await transformer(...values);
  return { value: () => result };
}
