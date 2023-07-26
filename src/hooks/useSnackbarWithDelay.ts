import { useSnackbar, ProviderContext } from "notistack";
import { ArrayMapGet } from "../fixAnimationSequence/ArrayMapGet";
export type EnqueueSnackbarParameters = Parameters<
  ProviderContext["enqueueSnackbar"]
>;

export type EnqueueSnackbar = ProviderContext["enqueueSnackbar"];
export type DelayEnqueueSnackbar = (
  delay: number,
  id: string | undefined,
  ...args: Parameters<ProviderContext["enqueueSnackbar"]>
) => void;
const timeoutMap = new Map<string, number[]>();
export function useSnackbarWithDelay() {
  const originalContext = useSnackbar();

  const delayEnqueueSnackbar = (
    delay: number,
    id: string | undefined,
    ...args: Parameters<ProviderContext["enqueueSnackbar"]>
  ) => {
    const timeoutId = window.setTimeout(() => {
      originalContext.enqueueSnackbar(...args);
      if (id !== undefined && timeoutMap.has(id)) {
        const timeoutIds = timeoutMap.get(id) as number[];
        const index = timeoutIds.indexOf(timeoutId);
        if (index !== -1) {
          timeoutIds.splice(index, 1);
        }
        if (timeoutIds.length === 0) {
          timeoutMap.delete(id);
        }
      }
    }, delay);
    if (id !== undefined) {
      ArrayMapGet(timeoutMap, id).push(timeoutId);
    }
  };
  return {
    ...originalContext,
    delayEnqueueSnackbar,
    stopDelayed: (id: string) => {
      if (timeoutMap.has(id)) {
        const arr = timeoutMap.get(id) as number[];
        arr.forEach((timeoutId) => {
          window.clearTimeout(timeoutId);
        });
        timeoutMap.delete(id);
      }
    },
  };
}
