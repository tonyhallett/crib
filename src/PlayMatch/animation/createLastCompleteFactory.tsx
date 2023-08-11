export type LastToCompleteFactory = () => () => void;

export function createLastCompleteFactory(
  lastCompleted: () => void
): LastToCompleteFactory {
  let numCompleted = 0;
  let numToComplete = 0;
  let completed = false;
  const complete = () => {
    numCompleted++;
    if (numCompleted === numToComplete) {
      completed = true;
      lastCompleted();
    }
  };
  return () => {
    if (completed) {
      throw new Error("Have already completed");
    }
    numToComplete++;
    return complete;
  };
}
