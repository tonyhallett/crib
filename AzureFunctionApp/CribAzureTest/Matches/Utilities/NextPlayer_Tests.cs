using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.State;
using CribAzureFunctionApp.Matches.Utilities;
using CribAzureTest.TestHelpers;
using System.Collections;

namespace CribAzureTest.Matches.Utilities
{
    public class NextPlayer_Tests
    {
        public class NextPlayerTestCase : TestCaseData
        {
            public NextPlayerTestCase(string currentPlayer,List<MatchPlayer> matchPlayers, List<bool> cannotGoes, string expectedNextPlayer)
                : base(currentPlayer, matchPlayers, cannotGoes, expectedNextPlayer)
            {
            }
        }
        public class NextPlayerDataCases : IEnumerable
        {
            private readonly List<bool> fourPlayersAllCanGo = new() { false, false, false, false };
            private readonly List<MatchPlayer> matchPlayersWithCards = new()
            {
                new MatchPlayer("p1", new List<PlayingCard>{ new PlayingCard(Suit.Clubs, Pips.Ace)},false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p2", new List<PlayingCard>{ new PlayingCard(Suit.Clubs, Pips.Ace)},false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p3", new List<PlayingCard>{ new PlayingCard(Suit.Clubs, Pips.Ace)},false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p4", new List<PlayingCard>{ new PlayingCard(Suit.Clubs, Pips.Ace)},false, Empty.HandAndBoxScoringHistory),
            };
            private readonly List<MatchPlayer> matchPlayersSecondWithoutCards = new()
            {
                new MatchPlayer("p1", new List<PlayingCard>{ new PlayingCard(Suit.Clubs, Pips.Ace)},false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p2", new List<PlayingCard>{},false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p3", new List<PlayingCard>{ new PlayingCard(Suit.Clubs, Pips.Ace)},false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p4", new List<PlayingCard>{ new PlayingCard(Suit.Clubs, Pips.Ace)},false, Empty.HandAndBoxScoringHistory),
            };
            public IEnumerator GetEnumerator()
            {
                yield return new NextPlayerTestCase(matchPlayersWithCards[0].Id, matchPlayersWithCards, fourPlayersAllCanGo, matchPlayersWithCards[1].Id)
                    .SetName("4 players with cards. all can go.  0 Moves to next");
                yield return new NextPlayerTestCase(matchPlayersWithCards[1].Id, matchPlayersWithCards, fourPlayersAllCanGo, matchPlayersWithCards[2].Id)
                   .SetName("4 players with cards. all can go.  1 Moves to 2");
                yield return new NextPlayerTestCase(matchPlayersWithCards[2].Id, matchPlayersWithCards, fourPlayersAllCanGo, matchPlayersWithCards[3].Id)
                   .SetName("4 players with cards. all can go.  2 Moves to 3");
                yield return new NextPlayerTestCase(matchPlayersWithCards[3].Id, matchPlayersWithCards, fourPlayersAllCanGo, matchPlayersWithCards[0].Id)
                   .SetName("4 players with cards. all can go.  3 Moves to first");

                yield return new NextPlayerTestCase(matchPlayersWithCards[0].Id, matchPlayersWithCards, new List<bool> { false, true, false, false }, matchPlayersWithCards[2].Id)
                    .SetName("4 players with cards. Next called go.  0 Moves to 2");
                
                yield return new NextPlayerTestCase(matchPlayersSecondWithoutCards[0].Id, matchPlayersSecondWithoutCards, fourPlayersAllCanGo, matchPlayersSecondWithoutCards[2].Id)
                    .SetName("Skipping player with no cards");

                    
            }
        }



        [TestCaseSource(typeof(NextPlayerDataCases))]
        public void Should_Return_Next_Player(string currentPlayer, List<MatchPlayer> matchPlayers, List<bool> cannotGoes, string expectedNextPlayer)
        {
            var nextPlayer = new NextPlayer();
            var nextPlayerId = nextPlayer.Get(currentPlayer, matchPlayers, cannotGoes);

            Assert.That(nextPlayerId, Is.EqualTo(expectedNextPlayer));
        }

        public class NextPlayerTurnOrderCases : IEnumerable
        {
            public IEnumerator GetEnumerator()
            {
                yield return new TestCaseData(
                    "p1", new List<string> { "p1", "p2", "p3" }, new List<string> { "p2", "p3", "p1" }
                ).SetName("Dealer first");
                yield return new TestCaseData(
                    "p2", new List<string> { "p1", "p2", "p3" }, new List<string> { "p3", "p1", "p2" }
                ).SetName("Dealer second");
                yield return new TestCaseData(
                    "p3", new List<string> { "p1", "p2", "p3" }, new List<string> { "p1", "p2", "p3" }
                ).SetName("Dealer third");

            }
        }

        [TestCaseSource(typeof(NextPlayerTurnOrderCases))]
        public void Should_Determine_Turn_Order(string dealerId, List<string> playerIds, List<string> expectedOrder)
        {
            var nextPlayer = new NextPlayer();
            Assert.That(nextPlayer.Turns(dealerId, playerIds), Is.EqualTo(expectedOrder));
        }


        public class ForNextStageCases : IEnumerable
        {
            public IEnumerator GetEnumerator()
            {
                var testNamePrefix = nameof(NextPlayer_Tests.ForNextStage_When_Game_Not_Won_Should_Advance_The_Current_Dealer_And_Next_Player);
                yield return new TestCaseData(
                    new List<string> { "p1", "p2", "p3" }, 0, 1, 2
                ).SetName($"{testNamePrefix} - Dealer first");
                yield return new TestCaseData(
                    new List<string> { "p1", "p2", "p3" }, 1, 2, 0
                ).SetName($"{testNamePrefix} - Dealer second");
                yield return new TestCaseData(
                    new List<string> { "p1", "p2", "p3" }, 2, 0, 1
                ).SetName($"{testNamePrefix} - Dealer last");


            }
        }

        [TestCaseSource(typeof(ForNextStageCases))]
        public void ForNextStage_When_Game_Not_Won_Should_Advance_The_Current_Dealer_And_Next_Player(
            List<string> playerIds,
            int currentDealerIndex,
            int expectedNextDealerIndex,
            int expectedNextPlayerIndex
        )
        {
            var dealerDetails = new DealerDetails("", playerIds[currentDealerIndex]);
            var nextPlayer = new NextPlayer();
            var nextPlayerForNextStage = nextPlayer.ForNextStage(false, dealerDetails, playerIds);

            Assert.Multiple(() =>
            {
                Assert.That(nextPlayerForNextStage, Is.EqualTo(playerIds[expectedNextPlayerIndex]));
                Assert.That(dealerDetails, Is.EqualTo(new DealerDetails("", playerIds[expectedNextDealerIndex])));
            });
        }
        // Be sure that the order by is correct with intergration ?
    }
}
