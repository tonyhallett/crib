# nullable enable

using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.Scoring;
using CribAzureFunctionApp.Matches.State;
using CribAzureFunctionApp.Matches.Utilities;
using System.Collections.Generic;
using System.Linq;

namespace CribAzureFunctionApp.Matches.MyMatches
{
    internal class MyMatchFactory : IMyMatchFactory
    {
        private readonly IScoreFinder scoreFinder;

        public MyMatchFactory(IScoreFinder scoreFinder)
        {
            this.scoreFinder = scoreFinder;
        }

        private static int GetNextIndex(int currentIndex, int numPlayers)
        {
            return currentIndex + 1 == numPlayers ? 0 : currentIndex + 1;
        }

        private (
            List<MatchPlayer> orderedOtherMatchPlayers, 
            MatchPlayer me, 
            List<Score> orderedScores,
            MyPegging myPegging
        ) 
        Order(
            CribMatch cribMatch,
            string myId
        )
        {
            var cannotGoes = cribMatch.Pegging.CannotGoes;
            
            var matchPlayers = cribMatch.GetPlayers();
            var myIndex = matchPlayers.FindIndex(p => p.Id == myId);
            List<bool> orderedPlayerGoes = new();

            var numPlayers = matchPlayers.Count;
            var orderedScores = new List<Score> { scoreFinder.Find(cribMatch, myId) };
            var teamScores = numPlayers == 4;
            var index = GetNextIndex(myIndex, numPlayers);
            if (teamScores)
            {
                orderedScores.Add(scoreFinder.Find(cribMatch, matchPlayers[index].Id));
            }
            var count = 0;
            List<MatchPlayer> orderedOtherMatchPlayers = new ();
            while (count < matchPlayers.Count - 1)
            {
                orderedPlayerGoes.Add(cannotGoes[index]);
                var otherMatchPlayer = matchPlayers[index];
                orderedOtherMatchPlayers.Add(otherMatchPlayer);
                if (!teamScores)
                {
                    orderedScores.Add(scoreFinder.Find(cribMatch, otherMatchPlayer.Id));
                }

                index = GetNextIndex(index, numPlayers);
                count++;
            }

            var myPegging = GetMyPegging(cribMatch.Pegging, cannotGoes[myIndex], orderedPlayerGoes);
            return (orderedOtherMatchPlayers, matchPlayers[myIndex], orderedScores.Distinct().ToList(),myPegging);
        }

        private static MyPegging GetMyPegging(Pegging pegging, bool myCannotGo, List<bool> orderedCannotGoes)
        {
            return new MyPegging(pegging.TurnedOverCards, pegging.InPlayCards, pegging.NextPlayer, myCannotGo, orderedCannotGoes, pegging.GoHistory);
        }

        private static (PlayingCard? cutCard, List<PlayingCard>? box) GetStateDependentCutCardAndBox(CribMatch match)
        {
            List<PlayingCard>? box = match.GameState >= CribGameState.Show ? match.Box : null;
            PlayingCard? cutCard = match.GameState == CribGameState.Discard ? null : match.CutCard;

            return (cutCard, box);
        }

        private static List<OtherPlayer> GetOtherPlayers(List<MatchPlayer> orderedOtherMatchPlayers)
        {
            return orderedOtherMatchPlayers.Select(player => new OtherPlayer(
                player.Id,
                player.Cards.Count <= 4,
                player.Ready,
                player.HandAndBoxScoringHistory)
            ).ToList();
        }

        public MyMatch ToMyMatch(CribMatch match, string playerId)
        {
            var (orderedOtherMatchPlayers, me, orderedScores, myPegging) = Order(match, playerId);

            var (cutCard, box) = GetStateDependentCutCardAndBox(match);

            var otherPlayers = GetOtherPlayers(orderedOtherMatchPlayers);
            return new MyMatch(
                match.Id,
                match.Title,
                match.GameState,
                match.MatchWinDeterminant,
                match.DealerDetails,
                match.ChangeHistory,
                match.ShowScoring,
                myPegging,
                orderedScores,
                cutCard,
                box,
                otherPlayers,
                me.Cards,
                me.HandAndBoxScoringHistory,
                me.Ready,
                playerId);
        }
    }
}
