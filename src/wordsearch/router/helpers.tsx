import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";

export const getIntParam = (param: string | undefined) => {
  return Number.parseInt(param ?? "0");
};

export function getFormDataDeserialized<T>(
  formData: FormData,
  name: string
): T {
  const serialized = formData.get(name) as string;
  return JSON.parse(serialized) as T;
}

export function singleFormDataEntry(name: string, value: unknown) {
  const formData: FormData = new FormData();
  formData.set(name, JSON.stringify(value));
  return formData;
}

function useTypedRootLoaderData<T>(): T {
  return useLoaderData() as T;
}

type DataFunctionNoResponseValue<T> = NonNullable<T> | null;

export interface LoaderFunctionT<TReturn, Context = unknown> {
  (args: LoaderFunctionArgs<Context>):
    | Promise<DataFunctionNoResponseValue<TReturn>>
    | DataFunctionNoResponseValue<TReturn>;
}

interface LoaderFunctionAndUseLoaderData<TReturn, Context> {
  loader: LoaderFunctionT<TReturn, Context>;
  useLoaderData: () => TReturn;
}

export function createLoaderFunctionAndUseLoaderData<
  TReturn,
  Context = unknown
>(
  loader: LoaderFunctionT<TReturn, Context>
): LoaderFunctionAndUseLoaderData<TReturn, Context> {
  return {
    loader,
    useLoaderData: useTypedRootLoaderData<TReturn>,
  };
}
