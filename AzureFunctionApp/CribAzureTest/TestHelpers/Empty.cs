using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.MyMatches;
using CribAzureFunctionApp.Matches.Scoring;
using CribAzureFunctionApp.Matches.Scoring.Scorer;
using CribAzureFunctionApp.Matches.State;

namespace CribAzureTest.TestHelpers
{
    internal static class Empty
    {
        public static List<Score> Scores => Enumerable.Empty<Score>().ToList();
        public static List<PlayingCard> Cards => Enumerable.Empty<PlayingCard>().ToList();
        public static List<PeggedCard> PeggedCards => Enumerable.Empty<PeggedCard>().ToList();
        public static List<bool> CannotGoes => Enumerable.Empty<bool>().ToList();
        public static List<Go> GoHistory => Enumerable.Empty<Go>().ToList();
        public static Pegging Pegging => new(PeggedCards, PeggedCards, "", CannotGoes, GoHistory);
        public static Pegging PeggingWithCannotGoes(int numPlayers)
        {
            return new(PeggedCards, PeggedCards, "", Pegging.AllCanGo(numPlayers), GoHistory);
        }
        public static MyPegging MyPegging => new(PeggedCards, PeggedCards,"",false, CannotGoes, GoHistory);
        public static PegScoring PegScoring => new (false, false, 0, 0, false);
        public static DealerDetails DealerDetails => new("", "");

        private static ScoringHistory<HighestScoringCards> NeverScored => new(0, 0, null);

        public static PlayerScoringHistory HandAndBoxScoringHistory => new(NeverScored, NeverScored, new ScoringHistory<HandAndBoxHighestScoringCards>(0, 0, null));
        public static MatchPlayer MatchPlayer(string playerId)
        {
            return new MatchPlayer(playerId, Cards, false, HandAndBoxScoringHistory);
        }

        public static MatchPlayer? MatchPlayer3Or4(List<string> playerIds, bool isPlayer3)
        {
            if (isPlayer3)
            {
                return playerIds.Count > 2 ? MatchPlayer(playerIds[2]) : null;
            }
            else
            {
                return playerIds.Count == 4 ? MatchPlayer(playerIds[3]) : null;
            }

        }

        public static Score Score => new(0, 0, 0);

        public static ChangeHistory ChangeHistory => new (DateTime.UtcNow, DateTime.UtcNow, 0);
    }
}
