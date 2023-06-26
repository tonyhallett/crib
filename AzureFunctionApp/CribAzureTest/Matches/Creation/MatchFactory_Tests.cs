using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.Creation;
using CribAzureFunctionApp.Matches.Deal;
using CribAzureFunctionApp.Matches.Scoring;
using CribAzureFunctionApp.Matches.State;
using CribAzureFunctionApp.Matches.Utilities;
using CribAzureFunctionApp.Utilities;
using Moq;
using System.Collections;
namespace CribAzureTest.Matches.Creation
{
    internal class MatchFactory_Tests
    {
        [Test]
        public void Should_Create_Match_With_Id()
        {
            var mockDealer = new Mock<ICribDealer>();
            var mockDealtCards = new Mock<ICribPlayingCards<PlayingCard>>();
            mockDealer.Setup(dealer => dealer.Deal(4)).Returns(mockDealtCards.Object);

            var mockIdFactory = new Mock<IIdFactory>();
            mockIdFactory.Setup(idFactory => idFactory.Get()).Returns("anid");
            var matchFactory = new MatchFactory(mockDealer.Object, new Mock<IRandomDealer>().Object, new Mock<INextPlayer>().Object, mockIdFactory.Object, new Mock<IDate>().Object);
            var match = matchFactory.Create(new MatchOptions(new List<string> { "1", "2", "3" }, "3", ""), "creator");

            Assert.That(match.Id, Is.EqualTo("anid"));
        }

        [Test]
        public void Should_Create_Match_With_Title_From_Options()
        {
            var mockDealer = new Mock<ICribDealer>();
            var mockDealtCards = new Mock<ICribPlayingCards<PlayingCard>>();
            mockDealer.Setup(dealer => dealer.Deal(4)).Returns(mockDealtCards.Object);

            var mockIdFactory = new Mock<IIdFactory>();
            mockIdFactory.Setup(idFactory => idFactory.Get()).Returns("anid");
            var matchFactory = new MatchFactory(mockDealer.Object, new Mock<IRandomDealer>().Object, new Mock<INextPlayer>().Object, mockIdFactory.Object, new Mock<IDate>().Object);
            var match = matchFactory.Create(new MatchOptions(new List<string> { "1", "2", "3" }, "3", "The title"), "creator");

            Assert.That(match.Title, Is.EqualTo("The title"));
        }

        [Test]
        public void Should_Create_Match_With_Start_Change_History()
        {
            var mockDealer = new Mock<ICribDealer>();
            var mockDealtCards = new Mock<ICribPlayingCards<PlayingCard>>();
            mockDealer.Setup(dealer => dealer.Deal(4)).Returns(mockDealtCards.Object);

            var mockIdFactory = new Mock<IIdFactory>();
            mockIdFactory.Setup(idFactory => idFactory.Get()).Returns("anid");
            var mockDate = new Mock<IDate>();

            var startDate = DateTime.UtcNow;
            mockDate.Setup(date => date.UTCNow()).Returns(startDate);
            var matchFactory = new MatchFactory(mockDealer.Object, new Mock<IRandomDealer>().Object, new Mock<INextPlayer>().Object, mockIdFactory.Object, mockDate.Object);
            var match = matchFactory.Create(new MatchOptions(new List<string> { "1", "2", "3" }, "3", ""), "creator");

            Assert.Multiple(() =>
            {
                var changeHistory = match.ChangeHistory;
                Assert.That(changeHistory, Is.EqualTo(new ChangeHistory(startDate, startDate, 0)));
            });

        }

        public class MatchPlayerTestCase
        {
            public MatchPlayerTestCase(List<string> otherPlayerIds, string creatorId, Action<CribMatch> playersAssertion)
            {
                OtherPlayerIds = otherPlayerIds;
                CreatorId = creatorId;
                PlayersAssertion = playersAssertion;
            }

            public string CreatorId { get; set; }
            public Action<CribMatch> PlayersAssertion { get; set; }
            public List<string> OtherPlayerIds { get; set; }
        }
        public class MatchFactoryPlayerCases : IEnumerable
        {
            public IEnumerator GetEnumerator()
            {
                void AssertPlayer1And2(CribMatch cribMatch)
                {
                    Assert.Multiple(() =>
                    {
                        Assert.That(cribMatch.Player1.Id, Is.EqualTo("creator"));
                        Assert.That(cribMatch.Player2.Id, Is.EqualTo("other1"));
                    });
                }

                void AssertPlayer1And2And3(CribMatch cribMatch)
                {
                    AssertPlayer1And2(cribMatch);
                    Assert.That(cribMatch.Player3!.Id, Is.EqualTo("other2"));
                }

                void Should_Be_Two_Players(CribMatch cribMatch)
                {
                    Assert.Multiple(() =>
                    {
                        AssertPlayer1And2(cribMatch);
                        Assert.That(cribMatch.Player3, Is.Null);
                        Assert.That(cribMatch.Player4, Is.Null);
                    });

                }


                yield return new TestCaseData(new MatchPlayerTestCase(new List<string> { "other1" }, "creator", Should_Be_Two_Players))
                    .SetName(nameof(Should_Be_Two_Players));

                void Should_Be_Three_Players(CribMatch cribMatch)
                {
                    Assert.Multiple(() =>
                    {
                        AssertPlayer1And2And3(cribMatch);
                        Assert.That(cribMatch.Player4, Is.Null);
                    });

                }

                yield return new TestCaseData(new MatchPlayerTestCase(new List<string> { "other1", "other2" }, "creator", Should_Be_Three_Players))
                    .SetName(nameof(Should_Be_Three_Players));

                void Should_Be_Four_Players(CribMatch cribMatch)
                {
                    Assert.Multiple(() =>
                    {
                        AssertPlayer1And2And3(cribMatch);
                        Assert.That(cribMatch.Player4!.Id, Is.EqualTo("other3"));
                    });

                }

                yield return new TestCaseData(new MatchPlayerTestCase(new List<string> { "other1", "other2", "other3" }, "creator", Should_Be_Four_Players))
                    .SetName(nameof(Should_Be_Four_Players));
            }
        }

        [TestCaseSource(typeof(MatchFactoryPlayerCases))]
        public void MatchFactory_Should_Create_Match_Players(MatchPlayerTestCase matchPlayerTestCase)
        {

            var mockDealer = new Mock<ICribDealer>();
            var mockDealtCards = new Mock<ICribPlayingCards<PlayingCard>>();
            mockDealer.Setup(dealer => dealer.Deal(matchPlayerTestCase.OtherPlayerIds.Count + 1)).Returns(mockDealtCards.Object);

            var matchFactory = new MatchFactory(mockDealer.Object, new Mock<IRandomDealer>().Object, new Mock<INextPlayer>().Object, new Mock<IIdFactory>().Object, new Mock<IDate>().Object);
            var match = matchFactory.Create(new MatchOptions(matchPlayerTestCase.OtherPlayerIds, "3", ""), matchPlayerTestCase.CreatorId);

            matchPlayerTestCase.PlayersAssertion(match!);

        }

        [Test]
        public void MatchFactory_Should_Create_Match_Players_With_Dealt_Cards()
        {
            var mockDealer = new Mock<ICribDealer>();
            var mockDealtCards = new Mock<ICribPlayingCards<PlayingCard>>();
            var player1Cards = new List<PlayingCard> { new PlayingCard(Suit.Spades, Pips.Jack) };
            var player2Cards = new List<PlayingCard> { new PlayingCard(Suit.Spades, Pips.Queen) };
            var player3Cards = new List<PlayingCard> { new PlayingCard(Suit.Spades, Pips.King) };
            var player4Cards = new List<PlayingCard> { new PlayingCard(Suit.Spades, Pips.Ace) };

            mockDealtCards.SetupGet(dealtCards => dealtCards.Player1Cards).Returns(player1Cards);
            mockDealtCards.SetupGet(dealtCards => dealtCards.Player2Cards).Returns(player2Cards);
            mockDealtCards.SetupGet(dealtCards => dealtCards.Player3Cards).Returns(player3Cards);
            mockDealtCards.SetupGet(dealtCards => dealtCards.Player4Cards).Returns(player4Cards);

            mockDealer.Setup(dealer => dealer.Deal(4)).Returns(mockDealtCards.Object);

            var matchFactory = new MatchFactory(mockDealer.Object, new Mock<IRandomDealer>().Object, new Mock<INextPlayer>().Object, new Mock<IIdFactory>().Object, new Mock<IDate>().Object);
            var match = matchFactory.Create(new MatchOptions(new List<string> { "1", "2", "3" }, "3", ""), "creator");

            Assert.Multiple(() =>
            {
                Assert.That(match!.Player1.Cards, Is.EqualTo(player1Cards));
                Assert.That(match!.Player2.Cards, Is.EqualTo(player2Cards));
                Assert.That(match!.Player3!.Cards, Is.EqualTo(player3Cards));
                Assert.That(match!.Player4!.Cards, Is.EqualTo(player4Cards));
            });

        }

        [Test]
        public void Should_Create_Match_With_No_Highest_Scoring()
        {
            var mockDealer = new Mock<ICribDealer>();
            var mockDealtCards = new Mock<ICribPlayingCards<PlayingCard>>();
            mockDealer.Setup(dealer => dealer.Deal(4)).Returns(mockDealtCards.Object);

            var matchFactory = new MatchFactory(mockDealer.Object, new Mock<IRandomDealer>().Object, new Mock<INextPlayer>().Object, new Mock<IIdFactory>().Object, new Mock<IDate>().Object);
            var match = matchFactory.Create(new MatchOptions(new List<string> { "1", "2", "3" }, "3", ""), "creator");

            match.GetPlayers().ForEach(player =>
            {
                var handAndBoxScoringHistory = player.HandAndBoxScoringHistory;
                var handAndBoxScoringHistories = new ScoringHistory<HighestScoringCards>[] {
                        handAndBoxScoringHistory.HandHistory, handAndBoxScoringHistory.BoxHistory
                };
                Assert.Multiple(() =>
                {
                    foreach (var scoringHistory in handAndBoxScoringHistories)
                    {
                        Assert.That(scoringHistory.NumScores, Is.EqualTo(0));
                        Assert.That(scoringHistory.TotalScore, Is.EqualTo(0));
                        Assert.That(scoringHistory.HighestScoringCards, Is.Null);
                    }

                    var handAndBoxHistory = handAndBoxScoringHistory.HandAndBoxHistory;
                    Assert.That(handAndBoxHistory.NumScores, Is.EqualTo(0));
                    Assert.That(handAndBoxHistory.TotalScore, Is.EqualTo(0));
                    Assert.That(handAndBoxHistory.HighestScoringCards, Is.Null);
                });
            });
        }

        [Test]
        public void MatchFactory_Should_Create_Match_With_Dealt_Cut_Card_And_Box()
        {
            var mockDealer = new Mock<ICribDealer>();
            var mockDealtCards = new Mock<ICribPlayingCards<PlayingCard>>();
            var box = new List<PlayingCard> { new PlayingCard(Suit.Diamonds, Pips.Ace) };
            var cutCard = new PlayingCard(Suit.Hearts, Pips.Ace);
            mockDealtCards.SetupGet(dealtCards => dealtCards.Box).Returns(box);
            mockDealtCards.SetupGet(dealtCards => dealtCards.CutCard).Returns(cutCard);

            mockDealer.Setup(dealer => dealer.Deal(4)).Returns(mockDealtCards.Object);

            var matchFactory = new MatchFactory(mockDealer.Object, new Mock<IRandomDealer>().Object, new Mock<INextPlayer>().Object, new Mock<IIdFactory>().Object, new Mock<IDate>().Object);
            var match = matchFactory.Create(new MatchOptions(new List<string> { "1", "2", "3" }, "3", ""), "creator");

            Assert.Multiple(() =>
            {
                Assert.That(match!.Box, Is.EqualTo(box));
                Assert.That(match!.CutCard, Is.EqualTo(cutCard));
            });

        }

        [Test]
        public void MatchFactory_Should_Create_Match_With_Random_Dealer()
        {
            var mockDealer = new Mock<ICribDealer>();
            var mockDealtCards = new Mock<ICribPlayingCards<PlayingCard>>();
            mockDealer.Setup(dealer => dealer.Deal(4)).Returns(mockDealtCards.Object);

            var mockRandomDealer = new Mock<IRandomDealer>();
            var otherPlayers = new List<string> { "1", "2", "3" };
            mockRandomDealer.Setup(randomDealer => randomDealer.Get(otherPlayers, "creator")).Returns("random");

            var matchFactory = new MatchFactory(mockDealer.Object, mockRandomDealer.Object, new Mock<INextPlayer>().Object, new Mock<IIdFactory>().Object, new Mock<IDate>().Object);
            var match = matchFactory.Create(new MatchOptions(otherPlayers, "3", ""), "creator");

            Assert.That(match!.DealerDetails, Is.EqualTo(new DealerDetails("random", "random")));
        }

        [Test]
        public void MatchFactory_Should_Create_Match_With_Pegging_Next_Player_After_Dealer()
        {
            var mockDealer = new Mock<ICribDealer>();
            var mockDealtCards = new Mock<ICribPlayingCards<PlayingCard>>();
            mockDealer.Setup(dealer => dealer.Deal(4)).Returns(mockDealtCards.Object);

            var mockRandomDealer = new Mock<IRandomDealer>();
            var otherPlayers = new List<string> { "1", "2", "3" };
            mockRandomDealer.Setup(randomDealer => randomDealer.Get(otherPlayers, "creator")).Returns("random");

            var mockNextPlayer = new Mock<INextPlayer>();
            mockNextPlayer.Setup(nextPlayer => nextPlayer.Get("random", new List<string> { "creator", "1", "2", "3" }, new List<bool> { false, false, false, false })).Returns("nextplayer");
            var matchFactory = new MatchFactory(mockDealer.Object, mockRandomDealer.Object, mockNextPlayer.Object, new Mock<IIdFactory>().Object, new Mock<IDate>().Object);
            var match = matchFactory.Create(new MatchOptions(otherPlayers, "3", ""), "creator");

            Assert.That(match!.Pegging.NextPlayer, Is.EqualTo("nextplayer"));
        }


        [Test]
        public void MatchFactory_Should_Create_Match_With_Discard_State()
        {
            var mockDealer = new Mock<ICribDealer>();
            var mockDealtCards = new Mock<ICribPlayingCards<PlayingCard>>();
            mockDealer.Setup(dealer => dealer.Deal(It.IsAny<int>())).Returns(mockDealtCards.Object);


            var matchFactory = new MatchFactory(mockDealer.Object, new Mock<IRandomDealer>().Object, new Mock<INextPlayer>().Object, new Mock<IIdFactory>().Object, new Mock<IDate>().Object);
            var match = matchFactory.Create(new MatchOptions(new List<string> { "other" }, "3", ""), "creator");

            Assert.That(match!.GameState, Is.EqualTo(CribGameState.Discard));
        }

        [TestCase(2, 2)]
        [TestCase(3, 3)]
        [TestCase(4, 2)]
        public void MatchFactory_Should_Create_Match_Appropriate_Number_Of_Zero_Scores(int numPlayers, int expectedNumberOfScores)
        {
            var mockDealer = new Mock<ICribDealer>();
            var mockDealtCards = new Mock<ICribPlayingCards<PlayingCard>>();
            mockDealer.Setup(dealer => dealer.Deal(numPlayers)).Returns(mockDealtCards.Object);

            var matchFactory = new MatchFactory(mockDealer.Object, new Mock<IRandomDealer>().Object, new Mock<INextPlayer>().Object, new Mock<IIdFactory>().Object, new Mock<IDate>().Object);

            var otherPlayers = Enumerable.Range(0, numPlayers - 1).Select(i => i.ToString()).ToList();
            var match = matchFactory.Create(new MatchOptions(otherPlayers, "3", ""), "creator");

            var scores = match.Scores;
            scores.ForEach(score => Assert.That(score, Is.EqualTo(new Score(0, 0, 0))));
            Assert.That(scores, Has.Count.EqualTo(expectedNumberOfScores));

        }

        [Test]
        public void Should_Create_Match_With_Players_Not_In_Ready_State()
        {
            var mockDealer = new Mock<ICribDealer>();
            var mockDealtCards = new Mock<ICribPlayingCards<PlayingCard>>();
            mockDealer.Setup(dealer => dealer.Deal(It.IsAny<int>())).Returns(mockDealtCards.Object);

            var matchFactory = new MatchFactory(mockDealer.Object, new Mock<IRandomDealer>().Object, new Mock<INextPlayer>().Object, new Mock<IIdFactory>().Object, new Mock<IDate>().Object);

            var match = matchFactory.Create(new MatchOptions(new List<string> { "p2", "p3", "p4" }, "3", ""), "creator");

            match.GetPlayers().ForEach(player => Assert.That(player.Ready, Is.False));
        }

        [TestCase("BestOf_3")]
        [TestCase("Unlimited")]
        public void Should_Create_Match_With_MatchWinDeterminant_From_Options(string matchWinDeterminant)
        {
            var mockDealer = new Mock<ICribDealer>();
            var mockDealtCards = new Mock<ICribPlayingCards<PlayingCard>>();
            mockDealer.Setup(dealer => dealer.Deal(It.IsAny<int>())).Returns(mockDealtCards.Object);

            var matchFactory = new MatchFactory(mockDealer.Object, new Mock<IRandomDealer>().Object, new Mock<INextPlayer>().Object, new Mock<IIdFactory>().Object, new Mock<IDate>().Object);

            var match = matchFactory.Create(new MatchOptions(new List<string> { "p2", "p3", "p4" }, matchWinDeterminant, ""), "creator");

            Assert.That(match.MatchWinDeterminant, Is.EqualTo(matchWinDeterminant));
        }

        [Test]
        public void Should_Create_Match_With_No_Pegged_Cards()
        {
            var mockDealer = new Mock<ICribDealer>();
            var mockDealtCards = new Mock<ICribPlayingCards<PlayingCard>>();
            mockDealer.Setup(dealer => dealer.Deal(It.IsAny<int>())).Returns(mockDealtCards.Object);

            var matchFactory = new MatchFactory(mockDealer.Object, new Mock<IRandomDealer>().Object, new Mock<INextPlayer>().Object, new Mock<IIdFactory>().Object, new Mock<IDate>().Object);

            var match = matchFactory.Create(new MatchOptions(new List<string> { "p2", "p3", "p4" }, "3", ""), "creator");

            Assert.Multiple(() =>
            {
                var pegging = match.Pegging;
                Assert.That(pegging.TurnedOverCards, Is.Empty);
                Assert.That(pegging.InPlayCards, Is.Empty);
            });
        }

        [Test]
        public void Should_Create_Match_With_No_Go_History()
        {
            var mockDealer = new Mock<ICribDealer>();
            var mockDealtCards = new Mock<ICribPlayingCards<PlayingCard>>();
            mockDealer.Setup(dealer => dealer.Deal(It.IsAny<int>())).Returns(mockDealtCards.Object);

            var matchFactory = new MatchFactory(mockDealer.Object, new Mock<IRandomDealer>().Object, new Mock<INextPlayer>().Object, new Mock<IIdFactory>().Object, new Mock<IDate>().Object);

            var match = matchFactory.Create(new MatchOptions(new List<string> { "p2", "p3", "p4" }, "3", ""), "creator");

            var pegging = match.Pegging;
            Assert.That(pegging.GoHistory, Is.Empty);
        }

        [TestCase(2)]
        [TestCase(3)]
        [TestCase(4)]
        public void Should_Create_Match_With_All_Players_Can_Go(int numPlayers)
        {
            var mockDealer = new Mock<ICribDealer>();
            var mockDealtCards = new Mock<ICribPlayingCards<PlayingCard>>();
            mockDealer.Setup(dealer => dealer.Deal(It.IsAny<int>())).Returns(mockDealtCards.Object);

            var matchFactory = new MatchFactory(mockDealer.Object, new Mock<IRandomDealer>().Object, new Mock<INextPlayer>().Object, new Mock<IIdFactory>().Object, new Mock<IDate>().Object);

            var otherPlayers = Enumerable.Repeat("", numPlayers - 1).ToList();
            var match = matchFactory.Create(new MatchOptions(otherPlayers, "3", ""), "creator");

            var pegging = match.Pegging;

            Assert.That(pegging.CannotGoes, Has.Count.EqualTo(numPlayers));
            var allCanGo = pegging.CannotGoes.All(cannotGo => cannotGo == false);
            Assert.That(allCanGo, Is.True);

        }
    }
}
