#nullable enable

using System;
using System.Collections.Generic;
using System.Linq;

namespace CribAzureFunctionApp.Matches.Scoring
{
    public class Score : IEquatable<Score>
    {
        public Score(int games, int frontPeg, int backPeg)
        {
            Games = games;
            FrontPeg = frontPeg;
            BackPeg = backPeg;
        }

        public int Games { get; set; }
        public int FrontPeg { get; set; }
        public int BackPeg { get; set; }

        public static List<Score> Initial(int numPlayers)
        {
            return Enumerable.Range(0, numPlayers).Select(_ => new Score(0, 0, 0)).ToList();
        }

        public bool Equals(Score? other)
        {
            if (other == null) return false;
            if (other == this) return true;
            return other.Games == Games && other.FrontPeg == FrontPeg && other.BackPeg == BackPeg;
        }
    }
}