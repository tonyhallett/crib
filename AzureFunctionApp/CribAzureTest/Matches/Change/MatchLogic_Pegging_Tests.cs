using Moq;
using CribAzureFunctionApp.Utilities;
using CribAzureFunctionApp.Matches.Change;
using CribAzureFunctionApp.Matches.Utilities;
using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.State;
using CribAzureFunctionApp.Matches.Scoring.Match;
using CribAzureFunctionApp.Matches.Scoring;
using CribAzureFunctionApp.Matches.Scoring.Scorer;
using CribAzureTest.TestHelpers;
using CribAzureFunctionApp.Matches.Deal;

namespace CribAzureTest.Matches.Change
{
    public class MatchLogic_Pegging_Tests
    {
        [Test]
        public void Should_Verify_Can_Peg()
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
                new MatchPlayer("p1", new List<PlayingCard> { Cards.AceDiamonds, Cards.AceHearts }, false, Empty.HandAndBoxScoringHistory),
                Empty.MatchPlayer(""),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceHearts,
                Empty.Cards,
                new DealerDetails("", ""),
                new Pegging(Empty.PeggedCards, Empty.PeggedCards, "", Empty.CannotGoes, Empty.GoHistory),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            matchLogic.Peg(match, "p1", Cards.AceDiamonds);

            mockMatchVerifier.Verify(matchVerifier => matchVerifier.VerifyPegging(match, "p1", Cards.AceDiamonds));
        }

        [TestCase(true)]
        [TestCase(false)]
        public void Should_Move_The_Peg_Card_To_In_Play_Cards_If_Not_31(bool peggerIsPlayer1)
        {
            var pegger = peggerIsPlayer1 ? "p1" : "p2";
            var peggerHand = new List<PlayingCard> { Cards.AceDiamonds };
            var otherHand = Empty.Cards;
            var p1Hand = peggerIsPlayer1 ? peggerHand : otherHand;
            var p2Hand = peggerIsPlayer1 ? otherHand : peggerHand;

            var pegging = new Pegging(Empty.PeggedCards, Empty.PeggedCards, "", Empty.CannotGoes, Empty.GoHistory);
            var match = new CribMatch(
                new MatchPlayer("p1", p1Hand, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p2", p2Hand, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceHearts,
                Empty.Cards,
                new DealerDetails("", ""),
                pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            var mockCribMatchScorer = new Mock<ICribMatchScorer>();
            var pegScoring = new PegScoring(false, false, 0, 4, false);
            mockCribMatchScorer.Setup(cribMatchScorer => cribMatchScorer.ScorePegging(
                match, 
                new List<PlayingCard> { Cards.AceDiamonds },
                true, 
                pegger)
            ).Returns((PeggingResult.Continue, pegScoring));

            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                mockCribMatchScorer.Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object,
                new Mock<IDate>().Object
                );

            matchLogic.Peg(match, pegger, Cards.AceDiamonds);

            Assert.Multiple(() =>
            {
                Assert.That(peggerHand, Is.Empty);
                Assert.That(pegging.InPlayCards, Is.EqualTo(new List<PeggedCard> { new PeggedCard(pegger, Cards.AceDiamonds, pegScoring) }));
            });
        }

        [Test]
        public void Should_Score_Pegging()
        {
            var mockCribScorer = new Mock<ICribMatchScorer>();
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object, mockCribScorer.Object, new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object, new Mock<IDate>().Object);

            var alreadyPeggedCard = new PeggedCard("p2", Cards.AceSpades, new PegScoring(false, false, 0, 0, false));
            var pegging = new Pegging(Empty.PeggedCards, new List<PeggedCard> { alreadyPeggedCard}, "", Empty.CannotGoes, Empty.GoHistory);
            var match = new CribMatch(
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p2", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceHearts,
                Empty.Cards,
                new DealerDetails("", ""),
                pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            matchLogic.Peg(match, "p1", Cards.AceDiamonds);

            mockCribScorer.Verify(cribScorer => cribScorer.ScorePegging(match, new List<PlayingCard> { alreadyPeggedCard.PlayingCard, Cards.AceDiamonds },true, "p1"));
        }

        [Test]
        public void Should_Turn_Over_Cards_And_Reset_CannotGoes_When_31_And_Pegging_Not_Completed()
        {
            var mockCribScorer = new Mock<ICribMatchScorer>();
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                mockCribScorer.Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object,
                new Mock<IDate>().Object);

            var turnedOverCard = new PeggedCard("p2", Cards.AceSpades, Empty.PegScoring);
            var inPlayCard = new PeggedCard("p1", Cards.EightDiamonds, Empty.PegScoring);
            var pegging = new Pegging(new List<PeggedCard> { turnedOverCard }, new List<PeggedCard> { inPlayCard }, "", new List<bool> { false, true }, Empty.GoHistory);
            var match = new CribMatch(
                new MatchPlayer("p1", new List<PlayingCard> { Cards.AceDiamonds }, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("", new List<PlayingCard> { Cards.AceSpades }, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            var pegScoring = new PegScoring(false, false, 0, 4, false);
            mockCribScorer.Setup(cribScorer => cribScorer.ScorePegging(match, new List<PlayingCard> { inPlayCard.PlayingCard, Cards.AceDiamonds },false, "p1")).Returns((PeggingResult.ThirtyOne, pegScoring));
            matchLogic.Peg(match, "p1", Cards.AceDiamonds);

            Assert.Multiple(() =>
            {
                Assert.That(pegging.InPlayCards, Is.Empty);
                Assert.That(pegging.TurnedOverCards, Is.EqualTo(new List<PeggedCard> { turnedOverCard, inPlayCard, new PeggedCard("p1", Cards.AceDiamonds, pegScoring) }));

                Assert.That(pegging.CannotGoes, Is.EqualTo(new List<bool> { false, false }));
            });
        }

        [TestCase(true)]
        [TestCase(false)]
        public void Should_Move_To_Show_State_When_Pegging_Complete(bool peggingComplete)
        {
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                new Mock<ICribMatchScorer>().Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object,
                new Mock<IDate>().Object);

            var player2Cards = peggingComplete ? Empty.Cards : new List<PlayingCard> { Cards.JackHearts };
            var match = new CribMatch(
                new MatchPlayer("p1", new List<PlayingCard> { Cards.AceDiamonds }, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p2", player2Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            matchLogic.Peg(match, "p1", Cards.AceDiamonds);

            Assert.That(match.GameState, Is.EqualTo(peggingComplete ? CribGameState.Show : CribGameState.Pegging));
        }

        [TestCase(1, "FirstTo_1", CribGameState.MatchWon)]
        [TestCase(0, "FirstTo_1", CribGameState.GameWon)]
        [TestCase(3, "FirstTo_3", CribGameState.MatchWon)]
        [TestCase(2, "FirstTo_3", CribGameState.GameWon)]
        [TestCase(2, "BestOf_3", CribGameState.MatchWon)]
        [TestCase(1, "BestOf_3", CribGameState.GameWon)]
        public void Should_Move_To_MatchWon_State_When_Match_Won(int gamesWon, string matchWinDeterminant, CribGameState expectedState)
        {
            var mockCribScorer = new Mock<ICribMatchScorer>();
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                mockCribScorer.Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object,
                new Mock<IDate>().Object);

            var turnedOver = new PeggedCard("p2", Cards.AceSpades, Empty.PegScoring);
            var pegging = new Pegging(new List<PeggedCard> { turnedOver }, Empty.PeggedCards, "", new List<bool> { false, true }, Empty.GoHistory);
            var match = new CribMatch(
                new MatchPlayer("p1", new List<PlayingCard> { Cards.AceDiamonds }, false, Empty.HandAndBoxScoringHistory),
                Empty.MatchPlayer(""),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                pegging,
                new List<Score> { new Score(gamesWon, 0, 0) },
                matchWinDeterminant, "id", Empty.ChangeHistory, "", null
            );
            mockCribScorer.Setup(cribScorer => cribScorer.ScorePegging(
                match, 
                new List<PlayingCard> { Cards.AceDiamonds }, 
                true, 
                "p1"
            )).Returns((PeggingResult.GameWon, new PegScoring(false, false, 0, 0, false)));

            matchLogic.Peg(match, "p1", Cards.AceDiamonds);

            Assert.That(match.GameState, Is.EqualTo(expectedState));
        }

        [TestCase(true)]
        [TestCase(false)]
        public void Should_Score_Show_When_Move_To_Show_State_When_Pegging_Complete(bool peggingComplete)
        {
            var mockCribMatchScorer = new Mock<ICribMatchScorer>();
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                mockCribMatchScorer.Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object,
                new Mock<IDate>().Object);

            var player2Cards = peggingComplete ? Empty.Cards : new List<PlayingCard> { Cards.JackHearts };
            var match = new CribMatch(
                new MatchPlayer("p1", new List<PlayingCard> { Cards.AceDiamonds }, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p2", player2Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            matchLogic.Peg(match, "p1", Cards.AceDiamonds);

            mockCribMatchScorer.Verify(cribMatchScorer => cribMatchScorer.ScoreShow(match), Times.Exactly(peggingComplete ? 1 : 0));
        }

        [Test]
        public void Should_Move_To_Game_Won_State_When_Game_Is_Won_And_Not_Match_Won_Through_Score_Show()
        {
            var mockCribMatchScorer = new Mock<ICribMatchScorer>();

            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                mockCribMatchScorer.Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object,
                new Mock<IDate>().Object);

            var match = new CribMatch(
                new MatchPlayer("p1", new List<PlayingCard> { Cards.AceDiamonds }, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p2", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "BestOf_3", "id", Empty.ChangeHistory, "", null
            );

            mockCribMatchScorer.Setup(cribMatchScorer => cribMatchScorer.ScoreShow(match)).Returns(true);


            matchLogic.Peg(match, "p1", Cards.AceDiamonds);

            Assert.That(match.GameState, Is.EqualTo(CribGameState.GameWon));
        }

        [TestCase(1, "FirstTo_1", CribGameState.MatchWon)]
        [TestCase(0, "FirstTo_1", CribGameState.GameWon)]
        [TestCase(3, "FirstTo_3", CribGameState.MatchWon)]
        [TestCase(2, "FirstTo_3", CribGameState.GameWon)]
        [TestCase(2, "BestOf_3", CribGameState.MatchWon)]
        [TestCase(1, "BestOf_3", CribGameState.GameWon)]
        public void Should_Move_To_Match_Won_State_When_Match_Won_Through_Score_Show(int gamesWon, string matchWinDeterminant, CribGameState expectedState)
        {
            var mockCribMatchScorer = new Mock<ICribMatchScorer>();

            var matchLogic = new MatchLogic(new Mock<IMatchVerifier>().Object, mockCribMatchScorer.Object, new Mock<INextPlayer>().Object, new Mock<ICribDealer>().Object, new Mock<IDate>().Object);

            var match = new CribMatch(
                new MatchPlayer("p1", new List<PlayingCard> { Cards.AceDiamonds }, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p2", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                new List<Score> { new Score(gamesWon, 0, 0) },
                matchWinDeterminant, "id", Empty.ChangeHistory, "", null
            );

            mockCribMatchScorer.Setup(cribMatchScorer => cribMatchScorer.ScoreShow(match)).Returns(true);


            matchLogic.Peg(match, "p1", Cards.AceDiamonds);

            Assert.That(match.GameState, Is.EqualTo(expectedState));
        }

        [Test]
        public void Should_Change_Next_Player_When_Pegging_Not_Complete()
        {
            var cannotGoes = new List<bool> { true, false };
            var pegging = new Pegging(new List<PeggedCard> { }, Empty.PeggedCards, "p1", cannotGoes, Empty.GoHistory);

            var player1 = new MatchPlayer("p1", new List<PlayingCard> { Cards.AceDiamonds }, false, Empty.HandAndBoxScoringHistory);
            var player2 = new MatchPlayer("p2", new List<PlayingCard> { Cards.FiveDiamonds }, false, Empty.HandAndBoxScoringHistory);

            var mockNextPlayer = new Mock<INextPlayer>();
            mockNextPlayer.Setup(nextPlayer => nextPlayer.Get("p1", new List<MatchPlayer> { player1, player2 }, cannotGoes)).Returns("nextplayer!");
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object, new Mock<ICribMatchScorer>().Object, mockNextPlayer.Object,
                new Mock<ICribDealer>().Object, new Mock<IDate>().Object);


            var match = new CribMatch(
                player1,
                player2,
                null,
                null,
                CribGameState.Pegging,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                pegging,
                Empty.Scores,
                "3",
                "id", Empty.ChangeHistory, "", null
            );

            matchLogic.Peg(match, "p1", Cards.AceDiamonds);

            Assert.That(match.Pegging.NextPlayer, Is.EqualTo("nextplayer!"));
        }

        [Test]
        public void Should_Update_The_Change_History()
        {
            var cannotGoes = new List<bool> { true, false };
            var pegging = new Pegging(new List<PeggedCard> { }, Empty.PeggedCards, "p1", cannotGoes, Empty.GoHistory);

            var mockDate = new Mock<IDate>();
            var utcNow = DateTime.UtcNow;
            mockDate.Setup(date => date.UTCNow()).Returns(utcNow);
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object, new Mock<ICribMatchScorer>().Object, new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object, mockDate.Object);

            var startDate = DateTime.UtcNow;
            var changeHistory = new ChangeHistory(startDate, startDate, 0);
            var match = new CribMatch(
                new MatchPlayer("p1", new List<PlayingCard> { Cards.AceDiamonds }, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p2", new List<PlayingCard> { Cards.FiveDiamonds }, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                pegging,
                Empty.Scores,
                "3",
                "id", changeHistory, "", null
            );

            matchLogic.Peg(match, "p1", Cards.AceDiamonds);

            Assert.That(match.ChangeHistory, Is.EqualTo(new ChangeHistory(startDate, utcNow, 1)));
        }
    }
}
