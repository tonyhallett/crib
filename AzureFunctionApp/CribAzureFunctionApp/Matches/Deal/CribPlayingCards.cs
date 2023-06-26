using System.Collections.Generic;

namespace CribAzureFunctionApp.Matches.Deal
{
    public class CribPlayingCards<TCard> : ICribPlayingCards<TCard>
    {
        public CribPlayingCards(TCard cutCard)
        {
            CutCard = cutCard;
        }
        public CribPlayingCards(TCard cutCard, TCard boxCard) : this(cutCard)
        {
            Box.Add(boxCard);
        }

        public List<TCard> Player1Cards { get; } = new List<TCard>();

        public List<TCard> Player2Cards { get; } = new List<TCard>();

        public List<TCard> Player3Cards { get; } = new List<TCard>();

        public List<TCard> Player4Cards { get; } = new List<TCard>();

        public List<TCard> Box { get; } = new List<TCard>();

        public TCard CutCard { get; }

        public List<List<TCard>> GetHands(int numPlayers)
        {
            var hands = new List<List<TCard>> { Player1Cards, Player2Cards };
            if (numPlayers >= 3)
            {
                hands.Add(Player3Cards);
            }
            if (numPlayers == 4)
            {
                hands.Add(Player4Cards);
            }
            return hands;

        }
    }
}