#nullable enable

namespace CribAzureFunctionApp.Matches.Scoring
{
    public class ScoreIncrementer : IScoreIncrementer
    {
        public void Increment(Score score, int increment)
        {

            if (score.FrontPeg > 0)
            {
                if (score.FrontPeg + increment >= 121)
                {
                    score.Games++;
                    score.FrontPeg = 0;
                    score.BackPeg = 0;
                    return;
                }
                score.BackPeg += increment;

            }
            score.FrontPeg += increment;
        }
    }
}
