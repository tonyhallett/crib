#nullable enable

using CribAzureFunctionApp.Matches.Card;
using System.Collections.Generic;
using System.Linq;

namespace CribAzureFunctionApp.Matches.Scoring.Scorer.Show
{
    public class ShowScore
    {
        public List<Pair> Pairs { get; set; } = new List<Pair>();
        public ThreeOfAKind? ThreeOfAKind { get; set; }
        public FourOfAKind? FourOfAKind { get; set; }
        public PlayingCard? OneForHisKnob { get; set; }
        public List<List<PlayingCard>> Runs { get; set; } = new List<List<PlayingCard>>();
        public List<List<PlayingCard>> FifteenTwos { get; set; } = new List<List<PlayingCard>>();
        public List<PlayingCard> Flush { get; set; } = new List<PlayingCard>();

        private int score;
        private bool scored;

        public int Score
        {
            get
            {
                if (!scored)
                {
                    score = Pairs.Count * 2 +
                       (ThreeOfAKind != null ? 6 : 0) +
                       (FourOfAKind != null ? 12 : 0) +

                       (OneForHisKnob != null ? 1 : 0) +
                       Runs.Sum(run => run.Count) +
                       FifteenTwos.Count * 2 +
                       Flush.Count;

                    scored = true;
                }
                return score;

            }
        }
    }
}