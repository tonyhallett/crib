using Moq;
using System.Collections;
using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.State;
using CribAzureFunctionApp.Matches.Scoring;
using CribAzureFunctionApp.Matches.MyMatches;
using CribAzureTest.TestHelpers;

namespace CribAzureTest.Matches.MyMatches
{
    public class MyMatchFactory_ToMyMatch_Tests
    {
        private readonly MyMatchFactory myMatchFactory;
        public MyMatchFactory_ToMyMatch_Tests()
        {
            myMatchFactory = new MyMatchFactory(new Mock<IScoreFinder>().Object);
        }

        #region Should pass on

        [TestCase(CribGameState.Discard)]
        [TestCase(CribGameState.Pegging)]
        [TestCase(CribGameState.Show)]
        public void Should_Pass_On_The_GameState(CribGameState gameState)
        {
            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                null,
                null,
                gameState,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.PeggingWithCannotGoes(2),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            Assert.That(myMatchFactory.ToMyMatch(match, "p1").GameState, Is.EqualTo(gameState));
        }

        [Test]
        public void Should_Pass_On_The_ShowScoring()
        {
            var showScoring = new ShowScoring(null, new List<PlayerShowScore>());
            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Show,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.PeggingWithCannotGoes(2),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", showScoring
            );

            Assert.That(myMatchFactory.ToMyMatch(match, "p1").ShowScoring, Is.SameAs(showScoring));
        }

        [Test]
        public void Should_Pass_On_My_Cards()
        {
            var myCards = new List<PlayingCard> { Cards.JackHearts };
            var match = new CribMatch(
                new MatchPlayer("p1", myCards, false, Empty.HandAndBoxScoringHistory),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Discard,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.PeggingWithCannotGoes(2),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            Assert.That(myMatchFactory.ToMyMatch(match, "p1").MyCards, Is.SameAs(myCards));
        }

        [Test]
        public void Should_Pass_On_My_Id()
        {
            var myCards = new List<PlayingCard> { Cards.JackHearts };
            var match = new CribMatch(
                new MatchPlayer("p1", myCards, false, Empty.HandAndBoxScoringHistory),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Discard,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.PeggingWithCannotGoes(2),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            Assert.That(myMatchFactory.ToMyMatch(match, "p1").MyId, Is.EqualTo("p1"));
        }

        [Test]
        public void Should_Pass_On_Change_History()
        {
            var myCards = new List<PlayingCard> { Cards.JackHearts };
            var match = new CribMatch(
                new MatchPlayer("p1", myCards, false, Empty.HandAndBoxScoringHistory),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Discard,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.PeggingWithCannotGoes(2),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            Assert.That(myMatchFactory.ToMyMatch(match, "p1").ChangeHistory, Is.SameAs(match.ChangeHistory));
        }

        [Test]
        public void Should_Pass_On_Title()
        {
            var myCards = new List<PlayingCard> { Cards.JackHearts };
            var match = new CribMatch(
                new MatchPlayer("p1", myCards, false, Empty.HandAndBoxScoringHistory),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Discard,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.PeggingWithCannotGoes(2),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "the title", null
            );

            Assert.That(myMatchFactory.ToMyMatch(match, "p1").Title, Is.SameAs(match.Title));
        }

        

        [Test]
        public void Should_Pass_On_DealerDetails()
        {
            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Discard,
                Cards.AceHearts,
                Empty.Cards,
                new DealerDetails("first", "second"),
                Empty.PeggingWithCannotGoes(2),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            Assert.That(myMatchFactory.ToMyMatch(match, "p1").DealerDetails, Is.SameAs(match.DealerDetails));
        }

        [Test]
        public void Should_Pass_On_MatchWinDeterminant()
        {
            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Discard,
                Cards.AceHearts,
                Empty.Cards,
                new DealerDetails("first", "second"),
                Empty.PeggingWithCannotGoes(2),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            Assert.That(myMatchFactory.ToMyMatch(match, "p1").MatchWinDeterminant, Is.SameAs(match.MatchWinDeterminant));
        }

        [Test]
        public void Should_Pass_On_Id()
        {
            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Discard,
                Cards.AceHearts,
                Empty.Cards,
                new DealerDetails("first", "second"),
                Empty.PeggingWithCannotGoes(2),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            Assert.That(myMatchFactory.ToMyMatch(match, "p1").Id, Is.SameAs(match.Id));
        }

        [TestCase(true)]
        [TestCase(false)]
        public void Should_Pass_On_My_Readiness(bool ready)
        {
            var match = new CribMatch(
                new MatchPlayer("p1", Empty.Cards, ready, Empty.HandAndBoxScoringHistory),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Discard,
                Cards.AceHearts,
                Empty.Cards,
                new DealerDetails("first", "second"),
                Empty.PeggingWithCannotGoes(2),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            Assert.That(myMatchFactory.ToMyMatch(match, "p1").MyReady, Is.EqualTo(match.Player1.Ready));
        }

        [Test]
        public void Should_Pass_On_My_Scoring_History()
        {
            var match = new CribMatch(
                new MatchPlayer("p1", Empty.Cards, true, Empty.HandAndBoxScoringHistory),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Discard,
                Cards.AceHearts,
                Empty.Cards,
                new DealerDetails("first", "second"),
                Empty.PeggingWithCannotGoes(2),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            Assert.That(myMatchFactory.ToMyMatch(match, "p1").MyScoringHistory, Is.SameAs(match.Player1.HandAndBoxScoringHistory));
        }

        #endregion

        public class OrderedOtherPlayersCases : IEnumerable
        {
            public IEnumerator GetEnumerator()
            {
                yield return new TestCaseData(
                    new List<string> { "p1", "p2" },
                    0,// my index
                    new List<string> { "p2" }
                ).SetName("OrderedOtherPlayersCases Two players, index 0");
                yield return new TestCaseData(
                    new List<string> { "p1", "p2" },
                    1,//my index
                    new List<string> { "p1" }
                ).SetName("OrderedOtherPlayersCases Two players, index 1");

                yield return new TestCaseData(
                   new List<string> { "p1", "p2", "p3" },
                   0,
                   new List<string> { "p2", "p3" }
               ).SetName("OrderedOtherPlayersCases Three players, index 0");
                yield return new TestCaseData(
                   new List<string> { "p1", "p2", "p3" },
                   1,
                   new List<string> { "p3", "p1" }
               ).SetName("OrderedOtherPlayersCases Three players, index 1");
                yield return new TestCaseData(
                   new List<string> { "p1", "p2", "p3" },
                   2,
                   new List<string> { "p1", "p2" }
               ).SetName("OrderedOtherPlayersCases Three players, index 2");

                yield return new TestCaseData(
                   new List<string> { "p1", "p2", "p3", "p4" },
                   0,
                   new List<string> { "p2", "p3", "p4" }
               ).SetName("OrderedOtherPlayersCases Four players, index 0");
                yield return new TestCaseData(
                   new List<string> { "p1", "p2", "p3", "p4" },
                   1,
                   new List<string> { "p3", "p4", "p1" }
               ).SetName("OrderedOtherPlayersCases Four players, index 1");
                yield return new TestCaseData(
                   new List<string> { "p1", "p2", "p3", "p4" },
                   2,
                   new List<string> { "p4", "p1", "p2" }
               ).SetName("OrderedOtherPlayersCases Four players, index 2");
                yield return new TestCaseData(
                   new List<string> { "p1", "p2", "p3", "p4" },
                   3,
                   new List<string> { "p1", "p2", "p3" }
               ).SetName("OrderedOtherPlayersCases Four players, index 3");
            }
        }

        [TestCaseSource(typeof(OrderedOtherPlayersCases))]
        public void Should_Contain_Ordered_Other_Players(
            List<string> players,
            int myIndex,
            List<string> expectedOtherPlayerIds
            )
        {
            var match = new CribMatch(
                Empty.MatchPlayer(players[0]),
                Empty.MatchPlayer(players[1]),
                Empty.MatchPlayer3Or4(players, true),
                Empty.MatchPlayer3Or4(players, false),
                CribGameState.Discard,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.PeggingWithCannotGoes(players.Count),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            var myMatch = myMatchFactory.ToMyMatch(match, players[myIndex]);


            Assert.That(myMatch.OtherPlayers.Select(otherPlayer => otherPlayer.Id), Is.EqualTo(expectedOtherPlayerIds));
        }
        public class OrderedScoresCases : IEnumerable
        {
            public class OrderedScoreCase : TestCaseData
            {
                public OrderedScoreCase(List<string> playerNames, int myIndex, List<int> expectedScoreIndices) :
                    base(playerNames, myIndex, expectedScoreIndices)
                { }
            }

            public IEnumerator GetEnumerator()
            {
                yield return new OrderedScoreCase(
                    new List<string> { "p1", "p2" },
                    0,// my index
                    new List<int> { 0, 1 }
                ).SetName("OrderedScoresCases Two players, index 0");
                yield return new OrderedScoreCase(
                    new List<string> { "p1", "p2" },
                    1,//my index
                    new List<int> { 1, 0 }
                ).SetName("OrderedScoresCases Two players, index 1");

                yield return new OrderedScoreCase(
                   new List<string> { "p1", "p2", "p3" },
                   0,
                   new List<int> { 0, 1, 2 }
               ).SetName("OrderedScoresCases Three players, index 0");
                yield return new OrderedScoreCase(
                   new List<string> { "p1", "p2", "p3" },
                   1,
                   new List<int> { 1, 2, 0 }
               ).SetName("OrderedScoresCases Three players, index 1");
                yield return new OrderedScoreCase(
                   new List<string> { "p1", "p2", "p3" },
                   2,
                   new List<int> { 2, 0, 1 }
               ).SetName("OrderedScoresCases Three players, index 2");

                yield return new OrderedScoreCase(
                   new List<string> { "p1", "p2", "p3", "p4" },
                   0,
                   new List<int> { 0, 1 }
               ).SetName("OrderedScoresCases Four players, index 0");
                yield return new OrderedScoreCase(
                   new List<string> { "p1", "p2", "p3", "p4" },
                   1,
                   new List<int> { 1, 0 }
               ).SetName("OrderedScoresCases Four players, index 1");
                yield return new OrderedScoreCase(
                   new List<string> { "p1", "p2", "p3", "p4" },
                   2,
                   new List<int> { 0, 1 }
               ).SetName("OrderedScoresCases Four players, index 2");
                yield return new OrderedScoreCase(
                   new List<string> { "p1", "p2", "p3", "p4" },
                   3,
                   new List<int> { 1, 0 }
               ).SetName("OrderedScoresCases Four players, index 3");
            }
        }

        [TestCaseSource(typeof(OrderedScoresCases))]
        public void Should_Have_Ordered_Scores(List<string> players, int myIndex, List<int> expectedScoreIndices)
        {
            var scores = Enumerable.Range(0, players.Count == 4 ? 2 : players.Count).Select(i => new Score(i, 0, 0)).ToList();
            var match = new CribMatch(
                Empty.MatchPlayer(players[0]),
                Empty.MatchPlayer(players[1]),
                Empty.MatchPlayer3Or4(players, true),
                Empty.MatchPlayer3Or4(players, false),
                CribGameState.Discard,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.PeggingWithCannotGoes(players.Count),
                scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            var myMatchFactory = new MyMatchFactory(new ScoreFinder());



            var myMatch = myMatchFactory.ToMyMatch(match, players[myIndex]);
            var orderedScores = myMatch.Scores;
            var orderedScoreIndices = orderedScores.Select(orderedScore => scores.IndexOf(orderedScore));

            Assert.That(orderedScoreIndices, Is.EqualTo(expectedScoreIndices));
        }

        public class OrderedPeggingCannotGoesCases : IEnumerable
        {
            public class OrderedPeggingCannotGoesCase : TestCaseData
            {
                public OrderedPeggingCannotGoesCase(
                    List<string> playerIds,
                    int myIndex,
                    List<bool> cannotGoes,
                    bool expectedMyCannotGo,
                    List<bool> expectedCannotGoes
                ):base(playerIds, myIndex, cannotGoes, expectedMyCannotGo, expectedCannotGoes)
                {

                }
            }
            public IEnumerator GetEnumerator()
            {
                yield return new OrderedPeggingCannotGoesCase(new List<string> { "p1", "p2" }, 0, new List<bool> { true, false }, true, new List<bool> { false });
                yield return new OrderedPeggingCannotGoesCase(new List<string> { "p1", "p2" }, 1, new List<bool> { true, false }, false, new List<bool> { true });


            }
        }

        [TestCaseSource(typeof(OrderedPeggingCannotGoesCases))]
        public void Should_Order_Pegging_CannotGoes(
            List<string> playerIds,
            int myIndex, 
            List<bool> cannotGoes,
            bool expectedMyCannotGo, 
            List<bool> expectedCannotGoes)
        {
            var pegging = new Pegging(Empty.PeggedCards, Empty.PeggedCards,"",cannotGoes,Empty.GoHistory);
            var match = new CribMatch(
                Empty.MatchPlayer(playerIds[0]),
                Empty.MatchPlayer(playerIds[1]),
                Empty.MatchPlayer3Or4(playerIds, true),
                Empty.MatchPlayer3Or4(playerIds, false),
                CribGameState.Discard,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            var myPegging = myMatchFactory.ToMyMatch(match, playerIds[myIndex]).Pegging;

            Assert.Multiple(() =>
            {
                Assert.That(myPegging.MyCannotGo, Is.EqualTo(expectedMyCannotGo));
                Assert.That(myPegging.CannotGoes, Is.EqualTo(expectedCannotGoes));
            });

        }
        
        [Test]
        public void Should_Pass_On_Other_Pegging_Properties()
        {
            var pegging = new Pegging(Empty.PeggedCards, Empty.PeggedCards, "next player", new List<bool> { false, false }, Empty.GoHistory);
            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Discard,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            var myPegging = myMatchFactory.ToMyMatch(match, "p1").Pegging;
            Assert.Multiple(() =>
            {
                Assert.That(myPegging.InPlayCards, Is.SameAs(pegging.InPlayCards));
                Assert.That(myPegging.TurnedOverCards, Is.SameAs(pegging.TurnedOverCards));
                Assert.That(myPegging.NextPlayer, Is.SameAs(pegging.NextPlayer));
                Assert.That(myPegging.GoHistory, Is.SameAs(pegging.GoHistory));
            });
        }



        [Test]
        public void Should_Contain_Other_Players_With_Discarded_State()
        {
            var match = new CribMatch(
                new MatchPlayer("p1", new List<PlayingCard> { Cards.AceDiamonds, Cards.TwoDiamonds, Cards.ThreeDiamonds, Cards.FourDiamonds }, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p2", new List<PlayingCard> { Cards.AceDiamonds, Cards.TwoDiamonds, Cards.ThreeDiamonds, Cards.FourDiamonds, Cards.JackHearts }, false, Empty.HandAndBoxScoringHistory),
                Empty.MatchPlayer("me"),
                null,
                CribGameState.Discard,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.PeggingWithCannotGoes(3),
                Empty.Scores,
                "3",
                "id", Empty.ChangeHistory, "", null
            );

            var myMatch = myMatchFactory.ToMyMatch(match, "me");
            var otherPlayers = myMatch.OtherPlayers;

            Assert.Multiple(() =>
            {
                Assert.That(otherPlayers[0].Discarded, Is.True);
                Assert.That(otherPlayers[1].Discarded, Is.False);
            });
        }

        [Test]
        public void Should_Contain_Other_Players_With_All_Discarded_When_Not_In_Discard_state()
        {
            var match = new CribMatch(
                Empty.MatchPlayer(""),
                Empty.MatchPlayer(""),
                Empty.MatchPlayer("me"),
                null,
                CribGameState.Pegging,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.PeggingWithCannotGoes(3),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            var myMatch = myMatchFactory.ToMyMatch(match, "me");
            var otherPlayers = myMatch.OtherPlayers;

            Assert.Multiple(() =>
            {
                Assert.That(otherPlayers[0].Discarded, Is.True);
                Assert.That(otherPlayers[1].Discarded, Is.True);
            });
        }

        [TestCase(CribGameState.Pegging)]
        [TestCase(CribGameState.Show)]
        [TestCase(CribGameState.GameWon)]
        [TestCase(CribGameState.MatchWon)]
        public void Should_Contain_The_Cut_Card_When_Not_In_Discard_State(CribGameState gameState)
        {
            var match = new CribMatch(
                Empty.MatchPlayer(""),
                Empty.MatchPlayer(""),
                Empty.MatchPlayer("me"),
                null,
                gameState,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.PeggingWithCannotGoes(3),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            var myMatch = myMatchFactory.ToMyMatch(match, "me");

            Assert.That(myMatch.CutCard, Is.SameAs(match.CutCard));
        }

        [Test]
        public void Should_Not_Contain_The_Cut_Card_When_In_Discard_State()
        {
            var match = new CribMatch(
                Empty.MatchPlayer(""),
                Empty.MatchPlayer(""),
                Empty.MatchPlayer("me"),
                null,
                CribGameState.Discard,
                Cards.AceHearts,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.PeggingWithCannotGoes(3),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            var myMatch = myMatchFactory.ToMyMatch(match, "me");

            Assert.That(myMatch.CutCard, Is.Null);
        }

        [TestCase(CribGameState.Discard)]
        [TestCase(CribGameState.Pegging)]
        [TestCase(CribGameState.Show)]
        [TestCase(CribGameState.GameWon)]
        [TestCase(CribGameState.MatchWon)]
        public void Should_Contain_The_Box_When_At_Least_Show_State(CribGameState gameState)
        {
            var match = new CribMatch(
                Empty.MatchPlayer(""),
                Empty.MatchPlayer(""),
                Empty.MatchPlayer("me"),
                null,
                gameState,
                Cards.AceHearts,
                new List<PlayingCard> { Cards.AceClubs },
                Empty.DealerDetails,
                Empty.PeggingWithCannotGoes(3),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );

            var myMatch = myMatchFactory.ToMyMatch(match, "me");
            var shouldProvideBox = gameState >= CribGameState.Show;
            if (shouldProvideBox)
            {
                Assert.That(myMatch.Box, Is.SameAs(match.Box));
            }
            else
            {
                Assert.That(myMatch.Box, Is.Null);
            }
        }
    }
}
