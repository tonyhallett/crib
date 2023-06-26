#nullable enable

using System.Collections.Generic;
using System.Linq;
using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.State;

namespace CribAzureFunctionApp.Matches.Utilities
{
    public static class CribMatchExtensions
    {
        public static List<MatchPlayer> GetPlayers(this CribMatch cribMatch)
        {
            var players = new List<MatchPlayer> { cribMatch.Player1, cribMatch.Player2 };
            if (cribMatch.Player3 != null)
            {
                players.Add(cribMatch.Player3);
            }
            if (cribMatch.Player4 != null)
            {
                players.Add(cribMatch.Player4);
            }
            return players;
        }

        public static List<PlayingCard> GetPlayerCards(this CribMatch match, string playerId)
        {
            var players = match.GetPlayers();
            var player = players.First(p => p.Id == playerId);
            return player.Cards;
        }

        public static bool IsPeggingCompleted(this CribMatch cribMatch)
        {
            var hands = cribMatch.GetPlayers().Select(player => player.Cards);
            return hands.All(h => h.Count == 0);
        }
    }
}