#nullable enable

namespace CribAzureFunctionApp.Matches.Scoring.Scorer
{
    public record PegScoring(bool Is31, bool Is15, int NumCardsInRun, int NumOfAKind, bool IsLastGo)
    {
        private int GetOfAKindScore()
        {
            switch (NumOfAKind)
            {
                case 2:
                    return 2;
                case 3:
                    return 6;
                case 4:
                    return 12;
                default:
                    return 0;
            }
        }
        public int Score
        {
            get
            {
                var score = 0;
                if (Is31 || Is15)
                {
                    score += 2;
                }

                if (NumCardsInRun >= 3)
                {
                    score += NumCardsInRun;
                }
                else
                {
                    score += GetOfAKindScore();
                }

                if (IsLastGo & !Is31)
                {
                    score += 1;
                }
                return score;
            }
        }
    }

}