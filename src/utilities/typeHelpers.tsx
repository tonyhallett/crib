export type PublicInterface<T> = Pick<T, keyof T>;

export const isError = (err: unknown): err is Error => err instanceof Error;
