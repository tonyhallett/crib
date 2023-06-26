using Moq;
using CribAzureFunctionApp.Utilities;
using CribAzureFunctionApp.Matches.Change;
using CribAzureFunctionApp.Matches.Utilities;
using CribAzureFunctionApp.Matches.State;
using CribAzureFunctionApp.Matches.Scoring.Match;
using CribAzureFunctionApp.Matches.Scoring;
using CribAzureTest.TestHelpers;
using CribAzureFunctionApp.Matches.Deal;

namespace CribAzureTest.Matches.Change
{
    public class MatchLogic_Go_Tests
    {
        [Test]
        public void Should_Verify()
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
                Empty.MatchPlayer(""),
                Empty.MatchPlayer(""),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceClubs,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            matchLogic.Go(match, "");

            mockMatchVerifier.Verify(verifier => verifier.VerifyGo(match, ""));
        }

        [TestCase(true)]
        [TestCase(false)]
        public void Should_Score_Go_When_All_Called_Go(bool allCalledGo)
        {
            var mockCribMatchScorer = new Mock<ICribMatchScorer>();
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                mockCribMatchScorer.Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object,
                new Mock<IDate>().Object
                );

            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceClubs,
                Empty.Cards,
                Empty.DealerDetails,
                new Pegging(Empty.PeggedCards, Empty.PeggedCards, "p1", new List<bool> { false, allCalledGo }, Empty.GoHistory),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            matchLogic.Go(match, "p1");

            mockCribMatchScorer.Verify(cribMatchScorer => cribMatchScorer.ScoreGo(match, "p1"), Times.Exactly(allCalledGo ? 1 : 0));

        }

        [TestCase(true)]
        [TestCase(false)]
        public void Should_Move_To_GameWon_State_When_Score_Go_And_Game_Won_And_Not_Match_Won(bool gameWon)
        {
            var mockCribMatchScorer = new Mock<ICribMatchScorer>();

            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                mockCribMatchScorer.Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object,
                new Mock<IDate>().Object
                );

            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceClubs,
                Empty.Cards,
                Empty.DealerDetails,
                new Pegging(Empty.PeggedCards, Empty.PeggedCards, "p1", new List<bool> { false, true }, Empty.GoHistory),
                Empty.Scores,
                "BestOf_3", "id", Empty.ChangeHistory, "", null
            );

            mockCribMatchScorer.Setup(cribMatchScorer => cribMatchScorer.ScoreGo(match, "p1")).Returns(gameWon);

            matchLogic.Go(match, "p1");

            Assert.That(match.GameState, Is.EqualTo(gameWon ? CribGameState.GameWon : CribGameState.Pegging));

        }

        [TestCase(1, "FirstTo_1", CribGameState.MatchWon)]
        [TestCase(0, "FirstTo_1", CribGameState.GameWon)]
        [TestCase(3, "FirstTo_3", CribGameState.MatchWon)]
        [TestCase(2, "FirstTo_3", CribGameState.GameWon)]
        [TestCase(2, "BestOf_3", CribGameState.MatchWon)]
        [TestCase(1, "BestOf_3", CribGameState.GameWon)]

        public void Should_Move_To_MatchWon_State_When_Score_Go_And__Match_Won(int gamesWon, string matchWinDeterminant, CribGameState expectedState)
        {
            var mockCribMatchScorer = new Mock<ICribMatchScorer>();

            var matchLogic = new MatchLogic(new Mock<IMatchVerifier>().Object, mockCribMatchScorer.Object, new Mock<INextPlayer>().Object, new Mock<ICribDealer>().Object, new Mock<IDate>().Object);

            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceClubs,
                Empty.Cards,
                Empty.DealerDetails,
                new Pegging(Empty.PeggedCards, Empty.PeggedCards, "p1", new List<bool> { false, true }, Empty.GoHistory),
                new List<Score> { new Score(gamesWon, 0, 0) },
                matchWinDeterminant, "id", Empty.ChangeHistory, "", null
            );

            mockCribMatchScorer.Setup(cribMatchScorer => cribMatchScorer.ScoreGo(match, "p1")).Returns(true);

            matchLogic.Go(match, "p1");

            Assert.That(match.GameState, Is.EqualTo(expectedState));

        }

        [TestCase(true)]
        [TestCase(false)]
        public void Should_Turn_Over_Cards_When_All_Called_Go(bool allCalledGo)
        {
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                new Mock<ICribMatchScorer>().Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object,
                new Mock<IDate>().Object);
            var pegging = new Pegging(
                new List<PeggedCard> {
                    new PeggedCard("p1", Cards.AceDiamonds, Empty.PegScoring)
                },
                new List<PeggedCard> { new PeggedCard("p2", Cards.AceSpades, Empty.PegScoring) }, "p1", new List<bool> { false, allCalledGo }, Empty.GoHistory);
            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceClubs,
                Empty.Cards,
                Empty.DealerDetails,
                pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            matchLogic.Go(match, "p1");


            if (allCalledGo)
            {
                Assert.Multiple(() =>
                {
                    Assert.That(pegging.InPlayCards, Is.Empty);
                    Assert.That(pegging.TurnedOverCards, Is.EqualTo(new List<PeggedCard> { new PeggedCard("p1", Cards.AceDiamonds, Empty.PegScoring), new PeggedCard("p2", Cards.AceSpades, Empty.PegScoring) }));
                });
            }
            else
            {
                Assert.Multiple(() =>
                {
                    Assert.That(pegging.InPlayCards, Is.EqualTo(new List<PeggedCard> { new PeggedCard("p2", Cards.AceSpades, Empty.PegScoring) }));
                    Assert.That(pegging.TurnedOverCards, Is.EqualTo(new List<PeggedCard> { new PeggedCard("p1", Cards.AceDiamonds, Empty.PegScoring) }));
                });
            }
        }

        [Test]
        public void Should_Set_All_Can_Go_When_All_Cannot_Go()
        {
            var matchLogic = new MatchLogic(new Mock<IMatchVerifier>().Object, new Mock<ICribMatchScorer>().Object, new Mock<INextPlayer>().Object, new Mock<ICribDealer>().Object, new Mock<IDate>().Object);
            var pegging = new Pegging(Empty.PeggedCards, Empty.PeggedCards, "p1", new List<bool> { false, true }, Empty.GoHistory);
            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceClubs,
                Empty.Cards,
                Empty.DealerDetails,
                pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            matchLogic.Go(match, "p1");

            Assert.That(pegging.CannotGoes, Is.EqualTo(new List<bool> { false, false }));
        }

        [TestCase(true)]
        [TestCase(false)]
        public void Should_Set_Cannot_Go_For_Player_When_Not_The_Last_To_Call(bool isPlayer1)
        {
            var playerThatCallsGo = isPlayer1 ? "p1" : "p2";
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                new Mock<ICribMatchScorer>().Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object
            , new Mock<IDate>().Object);
            var pegging = new Pegging(Empty.PeggedCards, Empty.PeggedCards, playerThatCallsGo, new List<bool> { false, false }, Empty.GoHistory);
            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceClubs,
                Empty.Cards,
                Empty.DealerDetails,
                pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            matchLogic.Go(match, playerThatCallsGo);

            var expectedCannotGoes = isPlayer1 ? new List<bool> { true, false } : new List<bool> { false, true };
            Assert.That(pegging.CannotGoes, Is.EqualTo(expectedCannotGoes));
        }

        [TestCase(true)]
        [TestCase(false)]
        public void Should_Set_The_Next_Player(bool isPlayer1)
        {
            var cannotGoPlayer = isPlayer1 ? "p1" : "p2";
            var pegging = new Pegging(Empty.PeggedCards, Empty.PeggedCards, cannotGoPlayer, new List<bool> { false, false }, Empty.GoHistory);

            var mockNextPlayer = new Mock<INextPlayer>();
            mockNextPlayer.Setup(nextPlayer => nextPlayer.Get(cannotGoPlayer, new List<string> { "p1", "p2" }, It.Is<List<bool>>(cannotGoes => cannotGoes == pegging.CannotGoes))).Returns("nextplayer");

            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                new Mock<ICribMatchScorer>().Object,
                mockNextPlayer.Object,
                new Mock<ICribDealer>().Object,
                new Mock<IDate>().Object
            );

            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceClubs,
                Empty.Cards,
                Empty.DealerDetails,
                pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            matchLogic.Go(match, cannotGoPlayer);

            Assert.That(match.Pegging.NextPlayer, Is.EqualTo("nextplayer"));


        }

        [TestCase(false, 4, 0)]
        [TestCase(true, 4, 1)]
        public void Should_Add_To_The_Go_History(bool isPlayer1, int turnedOverCardsCount, int inPlayCardsCount)
        {
            var cannotGoPlayer = isPlayer1 ? "p1" : "p2";
            var pegging = new Pegging(
                Enumerable.Repeat(new PeggedCard("", Cards.AceDiamonds, Empty.PegScoring), turnedOverCardsCount).ToList(),
                Enumerable.Repeat(new PeggedCard("", Cards.AceDiamonds, Empty.PegScoring), inPlayCardsCount).ToList(),
                cannotGoPlayer, new List<bool> { false, false },
                new List<Go> { new Go("p1", 1) }
                );

            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                new Mock<ICribMatchScorer>().Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object
            , new Mock<IDate>().Object);

            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceClubs,
                Empty.Cards,
                Empty.DealerDetails,
                pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            matchLogic.Go(match, cannotGoPlayer);

            Assert.That(match.Pegging.GoHistory, Is.EqualTo(new List<Go> { new Go("p1", 1), new Go(cannotGoPlayer, turnedOverCardsCount + inPlayCardsCount) }));
        }

        [Test]
        public void Should_Update_Change_History()
        {
            var changeDate = DateTime.UtcNow;
            var startDate = DateTime.UtcNow;
            var mockDate = new Mock<IDate>();
            mockDate.Setup(date => date.UTCNow()).Returns(changeDate);
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                new Mock<ICribMatchScorer>().Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object
            , mockDate.Object);

            var match = new CribMatch(
                Empty.MatchPlayer(""),
                Empty.MatchPlayer(""),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceClubs,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "3", "id", new ChangeHistory(startDate, startDate, 0), "", null
            );
            matchLogic.Go(match, "");

            Assert.That(match.ChangeHistory, Is.EqualTo(new ChangeHistory(startDate, changeDate, 1)));

        }
    }
}
