using Moq;
using CribAzureFunctionApp.Utilities;
using CribAzureFunctionApp.Matches.Change;
using CribAzureFunctionApp.Matches.Utilities;
using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.State;
using CribAzureFunctionApp.Matches.Scoring.Match;
using CribAzureFunctionApp.Matches.Scoring;
using CribAzureTest.TestHelpers;
using CribAzureFunctionApp.Matches.Deal;

namespace CribAzureTest.Matches.Change
{
    public class MatchLogic_Dicard_Tests
    {
        [Test]
        public void Should_Verify_Discard()
        {
            var mockMatchVerifier = new Mock<IMatchVerifier>();

            var matchLogic = new MatchLogic(
                mockMatchVerifier.Object,
                new Mock<ICribMatchScorer>().Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object,
                new Mock<IDate>().Object
            );

            var match = new CribMatch(
                Empty.MatchPlayer("discarder"),
                Empty.MatchPlayer(""),
                null,
                null,
                CribGameState.Discard,
                Cards.EightSpades,
                Empty.Cards,
                new DealerDetails("", ""),
                new Pegging(Empty.PeggedCards, Empty.PeggedCards, "", Empty.CannotGoes, Empty.GoHistory),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            matchLogic.Discard(match, "discarder", Cards.AceDiamonds, Cards.AceHearts);

            mockMatchVerifier.Verify(matchVerifier => matchVerifier.VerifyDiscard(match, "discarder", Cards.AceDiamonds, Cards.AceHearts));
        }

        [Test]
        public void Should_Discard_Cards_To_The_Box()
        {
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                new Mock<ICribMatchScorer>().Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object,
                new Mock<IDate>().Object);

            var box = Empty.Cards;
            var discarderCards = new List<PlayingCard> { Cards.AceDiamonds, Cards.AceHearts };
            var expectedBox = discarderCards.ToList();
            var match = new CribMatch(
                new MatchPlayer("p1", discarderCards, false, Empty.HandAndBoxScoringHistory),
                Empty.MatchPlayer(""),
                null,
                null,
                CribGameState.Discard,
                Cards.AceHearts,
                box,
                new DealerDetails("", ""),
                new Pegging(Empty.PeggedCards, Empty.PeggedCards, "", Empty.CannotGoes, Empty.GoHistory),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            matchLogic.Discard(match, "p1", Cards.AceDiamonds, Cards.AceHearts);

            Assert.Multiple(() =>
            {
                Assert.That(discarderCards, Is.Empty);
                Assert.That(box, Is.EqualTo(expectedBox));
            });
        }

        [TestCase(2, CribGameState.Pegging)]
        [TestCase(0, CribGameState.Discard)]
        public void Should_Change_The_GameState_To_Pegging_When_All_Players_Have_Discarded_To_The_Box(int cardsInBox, CribGameState expectedGameState)
        {
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object, new Mock<ICribMatchScorer>().Object, new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object, new Mock<IDate>().Object);

            var box = Enumerable.Range(0, cardsInBox).Select(i => Cards.QueenHearts).ToList();
            var match = new CribMatch(
                new MatchPlayer("p1", new List<PlayingCard> { Cards.AceDiamonds, Cards.AceHearts }, false, Empty.HandAndBoxScoringHistory),
                Empty.MatchPlayer(""),
                null,
                null,
                CribGameState.Discard,
                Cards.AceHearts,
                box,
                new DealerDetails("", ""),
                new Pegging(Empty.PeggedCards, Empty.PeggedCards, "", Empty.CannotGoes, Empty.GoHistory),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            matchLogic.Discard(match, "p1", Cards.AceDiamonds, Cards.AceHearts);

            Assert.That(match.GameState, Is.EqualTo(expectedGameState));
        }

        [Test]
        public void Should_Score_The_Cut_Card_When_All_Discarded()
        {
            var mockCribScorer = new Mock<ICribMatchScorer>();
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                mockCribScorer.Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object,
                new Mock<IDate>().Object
                );

            var match = new CribMatch(
                new MatchPlayer("p1", new List<PlayingCard> { Cards.AceDiamonds, Cards.AceHearts }, false, Empty.HandAndBoxScoringHistory),
                Empty.MatchPlayer(""),
                null,
                null,
                CribGameState.Discard,
                Cards.AceHearts,
                new List<PlayingCard> { Cards.SixDiamonds, Cards.FiveDiamonds },
                new DealerDetails("", ""),
                new Pegging(Empty.PeggedCards, Empty.PeggedCards, "", Empty.CannotGoes, Empty.GoHistory),
                Empty.Scores,
                "3",
                "id", Empty.ChangeHistory, "", null
            );
            matchLogic.Discard(match, "p1", Cards.AceDiamonds, Cards.AceHearts);

            mockCribScorer.Verify(cribScorer => cribScorer.ScoreCutCard(match));
        }

        [TestCase(true, CribGameState.GameWon)]
        [TestCase(false, CribGameState.Pegging)]
        public void Should_Move_To_GameWon_State_If_CutCard_Wins_The_Game_And_Not_the_Match(bool cutCardWinsGame, CribGameState expectedGameState)
        {
            var mockCribScorer = new Mock<ICribMatchScorer>();

            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                mockCribScorer.Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object,
                new Mock<IDate>().Object
                );

            var match = new CribMatch(
                new MatchPlayer("p1", new List<PlayingCard> { Cards.AceDiamonds, Cards.AceHearts }, false, Empty.HandAndBoxScoringHistory),
                Empty.MatchPlayer(""),
                null,
                null,
                CribGameState.Discard,
                Cards.AceHearts,
                new List<PlayingCard> { Cards.SixDiamonds, Cards.FiveDiamonds },
                new DealerDetails("", ""),
                new Pegging(Empty.PeggedCards, Empty.PeggedCards, "", Empty.CannotGoes, Empty.GoHistory),
                Empty.Scores,
                "BestOf_3", "id", Empty.ChangeHistory, "", null
            );

            mockCribScorer.Setup(cribScorer => cribScorer.ScoreCutCard(match)).Returns(cutCardWinsGame);

            matchLogic.Discard(match, "p1", Cards.AceDiamonds, Cards.AceHearts);

            Assert.That(match.GameState, Is.EqualTo(expectedGameState));
        }

        [TestCase(1, "FirstTo_1", CribGameState.MatchWon)]
        [TestCase(0, "FirstTo_1", CribGameState.GameWon)]
        [TestCase(3, "FirstTo_3", CribGameState.MatchWon)]
        [TestCase(2, "FirstTo_3", CribGameState.GameWon)]
        [TestCase(2, "BestOf_3", CribGameState.MatchWon)]
        [TestCase(1, "BestOf_3", CribGameState.GameWon)]
        [TestCase(1, "Unlimited", CribGameState.GameWon)]
        public void Should_Move_To_MatchWon_State_If_CutCard_Wins_The_Match(int gamesWon, string matchWinDeterminant, CribGameState expectedState)
        {
            var mockCribScorer = new Mock<ICribMatchScorer>();

            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                mockCribScorer.Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object,
                new Mock<IDate>().Object
            );

            var match = new CribMatch(
                new MatchPlayer("p1", new List<PlayingCard> { Cards.AceDiamonds, Cards.AceHearts }, false, Empty.HandAndBoxScoringHistory),
                Empty.MatchPlayer(""),
                null,
                null,
                CribGameState.Discard,
                Cards.AceHearts,
                new List<PlayingCard> { Cards.SixDiamonds, Cards.FiveDiamonds },
                new DealerDetails("", ""),
                new Pegging(Empty.PeggedCards, Empty.PeggedCards, "", Empty.CannotGoes, Empty.GoHistory),
                new List<Score> { new Score(gamesWon, 0, 0) },
                matchWinDeterminant,
                "id", Empty.ChangeHistory, "", null
            );

            mockCribScorer.Setup(cribScorer => cribScorer.ScoreCutCard(match)).Returns(true);

            matchLogic.Discard(match, "p1", Cards.AceDiamonds, Cards.AceHearts);

            Assert.That(match.GameState, Is.EqualTo(expectedState));
        }


        [Test]
        public void Should_Update_The_Change_History()
        {
            var mockCribScorer = new Mock<ICribMatchScorer>();

            var mockDate = new Mock<IDate>();
            var changeDate = DateTime.UtcNow;
            mockDate.Setup(date => date.UTCNow()).Returns(changeDate);
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                mockCribScorer.Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object,
                mockDate.Object
            );

            var startDate = DateTime.UtcNow;
            var match = new CribMatch(
                new MatchPlayer("p1", new List<PlayingCard> { Cards.AceDiamonds, Cards.AceHearts }, false, Empty.HandAndBoxScoringHistory),
                Empty.MatchPlayer(""),
                null,
                null,
                CribGameState.Discard,
                Cards.AceHearts,
                new List<PlayingCard> { Cards.SixDiamonds, Cards.FiveDiamonds },
                new DealerDetails("", ""),
                new Pegging(Empty.PeggedCards, Empty.PeggedCards, "", Empty.CannotGoes, Empty.GoHistory),
                new List<Score> { new Score(0, 0, 0) },
                "BestOf_3",
                "id", new ChangeHistory(startDate, startDate, 0), "", null
            );

            mockCribScorer.Setup(cribScorer => cribScorer.ScoreCutCard(match)).Returns(true);

            matchLogic.Discard(match, "p1", Cards.AceDiamonds, Cards.AceHearts);

            Assert.That(match.ChangeHistory, Is.EqualTo(new ChangeHistory(startDate, changeDate, 1)));
        }
    }
}
