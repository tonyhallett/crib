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
    public class MatchLogic_Ready_Tests
    {
        [Test]
        public void Should_Verify_Ready()
        {
            var mockVerifier = new Mock<IMatchVerifier>();
            var matchLogic = new MatchLogic(
                mockVerifier.Object,
                new Mock<ICribMatchScorer>().Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object
            , new Mock<IDate>().Object);
            var match = new CribMatch(
                Empty.MatchPlayer("player"),
                Empty.MatchPlayer(""),
                null,
                null,
                CribGameState.Show,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "3",
                "id", Empty.ChangeHistory, "", null
            );

            matchLogic.Ready(match, "player");

            mockVerifier.Verify(verifier => verifier.VerifyReady(match, "player"));
        }

        [Test]
        public void Should_Set_Player_Ready()
        {
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                new Mock<ICribMatchScorer>().Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object,
                new Mock<IDate>().Object);
            var readyPlayer = Empty.MatchPlayer("readyplayer1");
            var match = new CribMatch(
                readyPlayer,
                Empty.MatchPlayer(""),
                null,
                null,
                CribGameState.Show,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null);

            matchLogic.Ready(match, "readyplayer1");

            Assert.That(readyPlayer.Ready, Is.True);
        }

        [Test]
        public void Should_Update_Change_History()
        {
            var changeDate = DateTime.UtcNow;
            var startDate = DateTime.UtcNow;
            var mockDate = new Mock<IDate>();
            mockDate.Setup(date => date.UTCNow()).Returns(changeDate);

            var mockVerifier = new Mock<IMatchVerifier>();
            var matchLogic = new MatchLogic(
                mockVerifier.Object,
                new Mock<ICribMatchScorer>().Object,
                new Mock<INextPlayer>().Object,
                new Mock<ICribDealer>().Object,
                mockDate.Object);
            var readyPlayer = Empty.MatchPlayer("readyplayer1");
            var match = new CribMatch(
                readyPlayer,
                Empty.MatchPlayer(""),
                null,
                null,
                CribGameState.Show,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "3", "id", new ChangeHistory(startDate, startDate, 0), "", null
            );

            matchLogic.Ready(match, "readyplayer1");

            Assert.That(match.ChangeHistory, Is.EqualTo(new ChangeHistory(startDate, changeDate, 1)));
        }


    }

    [TestFixture(true)]
    [TestFixture(false)]
    public class MatchLogic_All_Ready_In_Show_State_Or_GameOver_State
    {
        private readonly DealerDetails dealerDetails = new("", "p1");
        private CribMatch match;
        private readonly ICribDealer cribDealer;
        private readonly CribPlayingCards<PlayingCard> cribPlayingCards;
        private readonly bool isShowState;

        public MatchLogic_All_Ready_In_Show_State_Or_GameOver_State(bool isShowState)
        {
            var mockCribDealer = new Mock<ICribDealer>();
            cribPlayingCards = new CribPlayingCards<PlayingCard>(Cards.AceSpades, Cards.AceClubs);
            cribPlayingCards.Player1Cards.AddRange(new List<PlayingCard> { Cards.TwoClubs });
            cribPlayingCards.Player2Cards.AddRange(new List<PlayingCard> { Cards.TwoSpades });
            cribPlayingCards.Player3Cards.AddRange(new List<PlayingCard> { Cards.TwoDiamonds });
            cribPlayingCards.Player4Cards.AddRange(new List<PlayingCard> { Cards.TwoHearts });

            mockCribDealer.Setup(dealer => dealer.Deal(4)).Returns(cribPlayingCards);
            cribDealer = mockCribDealer.Object;
            this.isShowState = isShowState;
        }

        [SetUp]
        public void Setup()
        {
            match = new(
                new MatchPlayer("p1", Empty.Cards, true, Empty.HandAndBoxScoringHistory),
                Empty.MatchPlayer("p2"),
                new MatchPlayer("p3", Empty.Cards, true, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p4", Empty.Cards, true, Empty.HandAndBoxScoringHistory),
                isShowState ? CribGameState.Show : CribGameState.GameWon,
                Cards.AceHearts,
                new List<PlayingCard> { Cards.AceDiamonds, Cards.TwoDiamonds, Cards.ThreeDiamonds, Cards.FourDiamonds },
                dealerDetails,
                new Pegging(
                    new List<PeggedCard> { new PeggedCard("", Cards.AceSpades, Empty.PegScoring) },
                    new List<PeggedCard> { new PeggedCard("", Cards.AceSpades, Empty.PegScoring) }, "p2", new List<bool> { true, false, true }, new List<Go> { new Go("p2", 1) }),
                new List<Score> { new Score(0, 6, 4) },
                "BestOf_3",
                "id", Empty.ChangeHistory, "", new ShowScoring(null, new List<PlayerShowScore>())
            );
        }

        [Test]
        public void Should_Deal_New_Cards()
        {
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                new Mock<ICribMatchScorer>().Object,
                new Mock<INextPlayer>().Object,
                cribDealer,
                new Mock<IDate>().Object);

            matchLogic.Ready(match, "p2");

            Assert.Multiple(() =>
            {
                Assert.That(match.Player1.Cards, Is.EqualTo(cribPlayingCards.Player1Cards));
                Assert.That(match.Player2.Cards, Is.EqualTo(cribPlayingCards.Player2Cards));
                Assert.That(match.Player3!.Cards, Is.EqualTo(cribPlayingCards.Player3Cards));
                Assert.That(match.Player4!.Cards, Is.EqualTo(cribPlayingCards.Player4Cards));
                Assert.That(match.Box, Is.EqualTo(new List<PlayingCard> { Cards.AceClubs }));
                Assert.That(match.CutCard, Is.EqualTo(Cards.AceSpades));
            });

        }

        [Test]
        public void Should_Remove_Player_Ready()
        {
            var matchLogic = new MatchLogic(new Mock<IMatchVerifier>().Object,
                                            new Mock<ICribMatchScorer>().Object,
                                            new Mock<INextPlayer>().Object,
                                            cribDealer,
                                            new Mock<IDate>().Object);

            matchLogic.Ready(match, "p2");

            match.GetPlayers().ForEach(player => Assert.That(player.Ready, Is.False));
        }

        [Test]
        public void Should_Reset_Pegging()
        {
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                new Mock<ICribMatchScorer>().Object,
                new Mock<INextPlayer>().Object,
                cribDealer,
                new Mock<IDate>().Object);

            matchLogic.Ready(match, "p2");


            Assert.Multiple(() =>
            {
                var pegging = match.Pegging;
                Assert.That(pegging.InPlayCards, Is.Empty);
                Assert.That(pegging.TurnedOverCards, Is.Empty);
                Assert.That(pegging.GoHistory, Is.Empty);
                Assert.That(pegging.CannotGoes, Is.EqualTo(new List<bool> { false, false, false, false }));

            });
        }

        [Test]
        public void Should_Set_Next_Player()
        {
            var mockNextPlayer = new Mock<INextPlayer>();
            mockNextPlayer.Setup(nextPlayer => nextPlayer.ForNextStage(!isShowState, dealerDetails, new List<string> { "p1", "p2", "p3", "p4" })).Returns("nextPlayer");
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                new Mock<ICribMatchScorer>().Object,
                mockNextPlayer.Object,
                cribDealer,
                new Mock<IDate>().Object);

            matchLogic.Ready(match, "p2");

            Assert.That(match.Pegging.NextPlayer, Is.EqualTo("nextPlayer"));
        }

        [Test]
        public void Should_Reset_Pegs_If_GameOver_State()
        {
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                new Mock<ICribMatchScorer>().Object,
                new Mock<INextPlayer>().Object,
                cribDealer,
                new Mock<IDate>().Object);

            matchLogic.Ready(match, "p2");

            var expectedScore = isShowState ? new Score(0, 6, 4) : new Score(0, 0, 0);
            Assert.That(match.Scores.First(), Is.EqualTo(expectedScore));
        }

        [Test]
        public void Should_Change_GameState_To_Discard()
        {
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                new Mock<ICribMatchScorer>().Object,
                new Mock<INextPlayer>().Object,
                cribDealer,
                new Mock<IDate>().Object);

            matchLogic.Ready(match, "p2");

            Assert.That(match.GameState, Is.EqualTo(CribGameState.Discard));
        }

        [Test]
        public void Should_Remove_ShowScoring()
        {
            var matchLogic = new MatchLogic(
                new Mock<IMatchVerifier>().Object,
                new Mock<ICribMatchScorer>().Object,
                new Mock<INextPlayer>().Object,
                cribDealer,
                new Mock<IDate>().Object);



            matchLogic.Ready(match, "p2");

            Assert.That(match.ShowScoring, Is.Null);
        }
    }
}
