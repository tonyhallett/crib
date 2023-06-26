#nullable enable

using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;

namespace CribAzureFunctionApp.Matches.Creation
{
    [ExcludeFromCodeCoverage]
    public class RandomDealer : IRandomDealer
    {
        private readonly Random random = new();
        public string Get(List<string> otherPlayers, string creator)
        {
            var players = new List<string>(otherPlayers)
            {
                creator
            };
            var index = random.Next(players.Count);
            return players[index];
        }
    }
}