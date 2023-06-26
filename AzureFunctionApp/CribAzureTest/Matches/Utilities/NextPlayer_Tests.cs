using CribAzureFunctionApp.Matches.State;
using CribAzureFunctionApp.Matches.Utilities;
using System.Collections;

namespace CribAzureTest.Matches.Utilities
{
    public class NextPlayer_Tests
    {
        public class NextPlayerDataCases : IEnumerable
        {
            private readonly List<bool> fourPlayersAllCanGo = new() { false, false, false, false };
            public IEnumerator GetEnumerator()
            {
                yield return new TestCaseData(
                    0, fourPlayersAllCanGo, 1
                ).SetName("4 players all can go.  0 Moves to next");
                yield return new TestCaseData(
                    1, fourPlayersAllCanGo, 2
                ).SetName("4 players all can go.  1 Moves to next");
                yield return new TestCaseData(
                    2, fourPlayersAllCanGo, 3
                ).SetName("4 players all can go.  2 Moves to next");
                yield return new TestCaseData(
                    3, fourPlayersAllCanGo, 0
                ).SetName("4 players all can go.  3 Moves to first");

                yield return new TestCaseData(
                    0, new List<bool> { false, true, false, false }, 2
                ).SetName("4 players next cannot go.  0 Moves to 2");
                yield return new TestCaseData(
                    0, new List<bool> { false, true, true, false }, 3
                ).SetName("4 players next two cannot go.  0 Moves to 3");
                yield return new TestCaseData(
                    0, new List<bool> { false, true, true, true }, 0
                ).SetName("4 players all apart from current cannot go.  Current player does not change");
                yield return new TestCaseData(
                    2, new List<bool> { false, false, false, true }, 0
                ).SetName("Cannot go cycle");
            }
        }



        [TestCaseSource(typeof(NextPlayerDataCases))]
        public void Should_Return_Next_Player(int currentPlayerIndex, List<bool> cannotGoes, int expectedNextPlayerIndex)
        {
            var playerIds = cannotGoes.Select((_, i) => $"player{i}").ToList();
            var currentPlayerId = playerIds[currentPlayerIndex];

            var nextPlayer = new NextPlayer();

            var nextPlayerId = nextPlayer.Get(currentPlayerId, playerIds, cannotGoes);

            Assert.That(nextPlayerId, Is.EqualTo(playerIds[expectedNextPlayerIndex]));
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
