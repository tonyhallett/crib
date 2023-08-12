#nullable enable

using CribAzureFunctionApp.Matches.State;
using System;
using System.Collections.Generic;

namespace CribAzureFunctionApp.Matches.Utilities
{
    public class NextPlayer : INextPlayer
    {
        private static string ConditionalGet(string currentPlayer, List<string> playerIds, Func<int,bool> condition)
        {
            var index = playerIds.IndexOf(currentPlayer);

            while (true)
            {
                var potentialNextIndex = GetPotentialNextIndex(playerIds, index);
                if (condition(potentialNextIndex))
                {
                    return playerIds[potentialNextIndex];
                }
                index = potentialNextIndex;
            }
        }

        private static string GetNextInTurn(string currentPlayer, List<string> playerIds)
        {
            return ConditionalGet(currentPlayer, playerIds, (_) => true);
        }

        public string Get(string currentPlayer, List<MatchPlayer> players, List<bool> cannotGoes)
        {
            var playerIds = players.ConvertAll(p => p.Id);
            return ConditionalGet(currentPlayer, playerIds, i => !cannotGoes[i] && players[i].Cards.Count != 0);
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
            var turn = GetNextInTurn(dealerId, playerIds);
            var turns = new List<string> { turn };
            while (turns.Count < playerIds.Count)
            {
                turn = GetNextInTurn(turn, playerIds);
                turns.Add(turn);
            }
            return turns;

        }

        public string ForNextStage(bool gameWon, DealerDetails dealerDetails, List<string> playerIds)
        {
            // gameWon tbd - may need additional parameters
            var currentDealer = dealerDetails.Current;
            var nextDealer = GetNextInTurn(currentDealer, playerIds);
            dealerDetails.Current = nextDealer;
            return GetNextInTurn(nextDealer, playerIds);

        }
    }
}