import { useSnackbar, ProviderContext } from "notistack";
export type EnqueueSnackbarParameters = Parameters<
  ProviderContext["enqueueSnackbar"]
>;
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
