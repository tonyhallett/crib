import { useSnackbar, ProviderContext } from "notistack";
export type EnqueueSnackbarParameters = Parameters<
  ProviderContext["enqueueSnackbar"]
>;

export type EnqueueSnackbar = ProviderContext["enqueueSnackbar"];
export type DelayEnqueueSnackbar = (
  delay: number,
  ...args: Parameters<ProviderContext["enqueueSnackbar"]>
) => void;
export function useSnackbarWithDelay() {
  const originalContext = useSnackbar();
  const delayEnqueueSnackbar = (
    delay: number,
    ...args: Parameters<ProviderContext["enqueueSnackbar"]>
  ) => {
    setTimeout(() => {
      originalContext.enqueueSnackbar(...args);
    }, delay);
  };
  return {
    ...originalContext,
    delayEnqueueSnackbar,
  };
}
