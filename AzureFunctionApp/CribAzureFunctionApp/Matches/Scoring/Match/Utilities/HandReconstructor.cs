#nullable enable

using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.State;
using CribAzureFunctionApp.Matches.Utilities;
using System.Collections.Generic;
using System.Linq;

namespace CribAzureFunctionApp.Matches.Scoring.Match.Utilities
{
    public class HandReconstructor : IHandReconstructor
    {
        private readonly INextPlayer nextPlayer;

        public HandReconstructor(INextPlayer nextPlayer)
        {
            this.nextPlayer = nextPlayer;
        }

        public IEnumerable<(string, IEnumerable<PlayingCard>)> Reconstruct(Pegging pegging, string dealerId, List<string> playerIds)
        {
            var playerPeggedCards = AllPeggedCardsGroupedByOwner(pegging);
            var turns = nextPlayer.Turns(dealerId, playerIds);

            return playerPeggedCards.OrderBy(g => turns.IndexOf(g.Key)).Select(g => (g.Key, g.Select(pc => pc.PlayingCard)));
        }

        private static IEnumerable<IGrouping<string, PeggedCard>> AllPeggedCardsGroupedByOwner(Pegging pegging)
        {
            var allCards = pegging.InPlayCards.Concat(pegging.TurnedOverCards);
            return allCards.GroupBy(peggedCard => peggedCard.Owner);
        }
    }
}
