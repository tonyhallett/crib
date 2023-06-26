using System.Collections.Generic;

namespace CribAzureFunctionApp.Matches.Deal
{
    public interface ICribPlayingCards<TCard>
    {
        public List<TCard> Player1Cards { get; }
        public List<TCard> Player2Cards { get; }
        public List<TCard> Player3Cards { get; }
        public List<TCard> Player4Cards { get; }
        public List<TCard> Box { get; }
        public TCard CutCard { get; }
    }
}