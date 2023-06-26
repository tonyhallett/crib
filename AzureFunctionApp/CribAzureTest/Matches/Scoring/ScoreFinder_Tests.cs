using CribAzureFunctionApp.Matches.Scoring;
using CribAzureFunctionApp.Matches.State;
using CribAzureTest.TestHelpers;

namespace CribAzureTest.Matches.Scoring
{
    internal class ScoreFinder_Tests
    {
        [TestCase("p1", 0)]
        [TestCase("p2", 1)]
        public void Should_Find_Score_For_Player_In_2_Player_Game(string findPlayerId, int expectedScoreIndex)
        {
            var scoreFinder = new ScoreFinder();
            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Discard,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                new List<Score> { new Score(1, 2, 3), new Score(2, 3, 4) },
                "3",
                "id", Empty.ChangeHistory, "", null);
            var score = scoreFinder.Find(match, findPlayerId);
            Assert.That(match.Scores.IndexOf(score), Is.EqualTo(expectedScoreIndex));
        }

        [TestCase("p1", 0)]
        [TestCase("p2", 1)]
        [TestCase("p3", 2)]
        public void Should_Find_Score_For_Player_In_3_Player_Game(string findPlayerId, int expectedScoreIndex)
        {
            var scoreFinder = new ScoreFinder();
            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                Empty.MatchPlayer("p3"),
                null,
                CribGameState.Discard,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                new List<Score> { new Score(1, 2, 3), new Score(2, 3, 4), new Score(5, 6, 7) },
                "3",
                "id", Empty.ChangeHistory, "", null);
            var score = scoreFinder.Find(match, findPlayerId);
            Assert.That(match.Scores.IndexOf(score), Is.EqualTo(expectedScoreIndex));
        }

        [TestCase("p1", 0)]
        [TestCase("p2", 1)]
        [TestCase("p3", 0)]
        [TestCase("p4", 1)]
        public void Should_Find_Score_For_Team_In_4_Player_Game(string findPlayerId, int expectedScoreIndex)
        {
            var scoreFinder = new ScoreFinder();
            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                Empty.MatchPlayer("p3"),
                Empty.MatchPlayer("p4"),
                CribGameState.Discard,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                new List<Score> { new Score(1, 2, 3), new Score(2, 3, 4), new Score(5, 6, 7), new Score(8, 9, 10) },
                "3",
                "id", Empty.ChangeHistory, "", null);
            var score = scoreFinder.Find(match, findPlayerId);
            Assert.That(match.Scores.IndexOf(score), Is.EqualTo(expectedScoreIndex));
        }
    }
}
