#nullable enable

using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.Scoring;
using CribAzureFunctionApp.Matches.State;
using System.Collections.Generic;

namespace CribAzureFunctionApp.Matches.MyMatches
{
    public class MyMatch
    {
        public MyMatch(
            string id,
            string title,
            CribGameState gameState,
            string matchWinDeterminant,
            DealerDetails dealerDetails,
            ChangeHistory changeHistory,
            ShowScoring? showScoring,
            MyPegging pegging,
            List<Score> scores,
            PlayingCard? cutCard,
            List<PlayingCard>? box,
            List<OtherPlayer> otherPlayers,
            List<PlayingCard> myCards,
            PlayerScoringHistory myScoringHistory,
            bool myReady,
            string myId)
        {
            Id = id;
            Title = title;
            GameState = gameState;
            MatchWinDeterminant = matchWinDeterminant;
            DealerDetails = dealerDetails;
            ChangeHistory = changeHistory;
            ShowScoring = showScoring;
            Pegging = pegging;
            Scores = scores;
            CutCard = cutCard;
            Box = box;
            OtherPlayers = otherPlayers;
            MyCards = myCards;
            MyReady = myReady;
            MyScoringHistory = myScoringHistory;
            MyId = myId;
        }

        public string Id { get; }
        public string Title { get; }
        public CribGameState GameState { get; }
        public string MatchWinDeterminant { get; }
        public DealerDetails DealerDetails { get; }
        public ChangeHistory ChangeHistory { get; internal set; }
        public ShowScoring? ShowScoring { get; }
        public MyPegging Pegging { get; }
        public List<Score> Scores { get; }
        public PlayingCard? CutCard { get; }
        public List<PlayingCard>? Box { get; }
        public List<OtherPlayer> OtherPlayers { get; }
        public List<PlayingCard> MyCards { get; }
        public bool MyReady { get; }
        public PlayerScoringHistory MyScoringHistory { get; }
        public string MyId { get; }
    }
}