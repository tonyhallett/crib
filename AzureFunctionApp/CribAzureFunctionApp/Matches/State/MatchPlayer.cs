#nullable enable

using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.Scoring;
using System.Collections.Generic;

namespace CribAzureFunctionApp.Matches.State
{
    public class MatchPlayer
    {
        public MatchPlayer(string id, List<PlayingCard> cards, bool ready, PlayerScoringHistory handAndBoxScoringHistory)
        {
            Id = id;
            Cards = cards;
            Ready = ready;
            HandAndBoxScoringHistory = handAndBoxScoringHistory;
        }

        public string Id { get; }
        public List<PlayingCard> Cards { get; set; }
        public bool Ready { get; internal set; }
        public PlayerScoringHistory HandAndBoxScoringHistory { get; }
    }
}