#nullable enable

using CribAzureFunctionApp.Matches.State;
using System.Collections.Generic;

namespace CribAzureFunctionApp.Matches.Utilities
{
    public class NextPlayer : INextPlayer
    {
        public string Get(string currentPlayer, List<string> playerIds, List<bool> cannotGoes)
        {
            var index = playerIds.IndexOf(currentPlayer);

            while (true)
            {
                var potentialNextIndex = GetPotentialNextIndex(playerIds, index);
                if (!cannotGoes[potentialNextIndex])
                {
                    return playerIds[potentialNextIndex];
                }
                index = potentialNextIndex;
            }
        }

        private static int GetPotentialNextIndex(List<string> playerIds, int index)
        {
            var nextIndex = 0;
            if (index < playerIds.Count - 1)
            {
                nextIndex = index + 1;
            }
            return nextIndex;
        }

        public List<string> Turns(string dealerId, List<string> playerIds)
        {
            var allCanGo = Pegging.AllCanGo(playerIds.Count);
            var turn = Get(dealerId, playerIds, allCanGo);
            var turns = new List<string> { turn };
            while (turns.Count < playerIds.Count)
            {
                turn = Get(turn, playerIds, allCanGo);
                turns.Add(turn);
            }
            return turns;

        }

        public string ForNextStage(bool gameWon, DealerDetails dealerDetails, List<string> playerIds)
        {
            // gameWon tbd - may need additional parameters
            var currentDealer = dealerDetails.Current;
            var allCanGo = Pegging.AllCanGo(playerIds.Count);
            var nextDealer = Get(currentDealer, playerIds, allCanGo);
            dealerDetails.Current = nextDealer;
            return Get(nextDealer, playerIds, allCanGo);

        }
    }
}