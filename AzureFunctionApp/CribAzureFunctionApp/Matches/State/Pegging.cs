#nullable enable

using System.Collections.Generic;
using System.Linq;

namespace CribAzureFunctionApp.Matches.State
{
    public class Pegging
    {
        public static List<bool> AllCanGo(int numPlayers)
        {
            return Enumerable.Repeat(false, numPlayers).ToList();
        }

        public Pegging(
            List<PeggedCard> turnedOverCards, 
            List<PeggedCard> inPlayCards, 
            string nextPlayer, 
            List<bool> cannotGoes, 
            List<Go> goHistory)
        {
            TurnedOverCards = turnedOverCards;
            InPlayCards = inPlayCards;
            NextPlayer = nextPlayer;
            CannotGoes = cannotGoes;
            GoHistory = goHistory;
        }

        public List<PeggedCard> TurnedOverCards { get; }
        public List<PeggedCard> InPlayCards { get; private set; }
        public string NextPlayer { get; set; }
        public List<bool> CannotGoes { get; set; }
        public List<Go> GoHistory { get; }

    }
}