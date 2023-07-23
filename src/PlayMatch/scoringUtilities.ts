export const getOfAKindScore = (numOfAKind: number) => {
  let ofAKindScore = 0;
  switch (numOfAKind) {
    case 2:
      ofAKindScore = 2;
      break;
    case 3:
      ofAKindScore = 6;
      break;
    case 4:
      ofAKindScore = 12;
      break;
  }
  return ofAKindScore;
};
