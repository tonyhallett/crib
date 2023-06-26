#nullable enable

using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.Deal;
using CribAzureFunctionApp.Matches.Scoring;
using CribAzureFunctionApp.Matches.State;
using CribAzureFunctionApp.Matches.Utilities;
using CribAzureFunctionApp.Utilities;
using System.Collections.Generic;
using System.Linq;

namespace CribAzureFunctionApp.Matches.Creation
{
    public class MatchFactory : IMatchFactory
    {
        private readonly ICribDealer cribDealer;
        private readonly IRandomDealer randomDealer;
        private readonly INextPlayer nextPlayer;
        private readonly IIdFactory idFactory;
        private readonly IDate date;

        public MatchFactory(
            ICribDealer cribDealer,
            IRandomDealer randomDealer,
            INextPlayer nextPlayer,
            IIdFactory idFactory,
            IDate date)
        {
            this.cribDealer = cribDealer;
            this.randomDealer = randomDealer;
            this.nextPlayer = nextPlayer;
            this.idFactory = idFactory;
            this.date = date;
        }

        private string GetNextPlayerForPegging(string dealer, string creator, List<string> otherPlayers)
        {
            var allPlayers = new List<string> { creator };
            allPlayers.AddRange(otherPlayers);

            return nextPlayer.Get(dealer, allPlayers, Pegging.AllCanGo(allPlayers.Count));
        }

        private static ScoringHistory<HighestScoringCards> NeverScored => new(0, 0, null);

        private static PlayerScoringHistory NeverScoredScoringHistory => new(NeverScored, NeverScored, new ScoringHistory<HandAndBoxHighestScoringCards>(0, 0, null));
        
        private static MatchPlayer CreateMatchPlayer(string playerId, List<PlayingCard> cards)
        {
            return new MatchPlayer(playerId, cards, false, NeverScoredScoringHistory);
        }

        private ChangeHistory InitialChangeHistory()
        {
            var utcNow = date.UTCNow();
            return new ChangeHistory(utcNow, utcNow, 0);
        }

        public CribMatch Create(MatchOptions options, string creator)
        {
            var otherPlayers = options.OtherPlayers;
            var cribPlayingCards = cribDealer.Deal(1 + options.OtherPlayers.Count);

            var initialDealer = randomDealer.Get(otherPlayers, creator);
            
            return new CribMatch(
                CreateMatchPlayer(creator, cribPlayingCards.Player1Cards),
                CreateMatchPlayer(otherPlayers[0], cribPlayingCards.Player2Cards),
                otherPlayers.Count > 1 ? CreateMatchPlayer(otherPlayers[1], cribPlayingCards.Player3Cards) : null,
                otherPlayers.Count == 3 ? CreateMatchPlayer(otherPlayers[2], cribPlayingCards.Player4Cards): null,
                CribGameState.Discard,
                cribPlayingCards.CutCard,
                cribPlayingCards.Box,
                new DealerDetails(initialDealer, initialDealer),
                new Pegging(
                    new List<PeggedCard>(), 
                    new List<PeggedCard>(), 
                    GetNextPlayerForPegging(initialDealer, creator, otherPlayers),
                    Pegging.AllCanGo(otherPlayers.Count + 1), 
                    new List<Go>()
                ),
                GetInitialScores(otherPlayers.Count + 1),
                options.MatchWinDeterminant,
                idFactory.Get(),
                InitialChangeHistory(),
                options.Title,
                null
            ); ;
        }

        private static List<Score> GetInitialScores(int numPlayers)
        {
            var numScores = numPlayers == 4 ? 2 : numPlayers;
            return Enumerable.Range(0, numScores).Select(i => new Score(0, 0, 0)).ToList();
        }
    }
}