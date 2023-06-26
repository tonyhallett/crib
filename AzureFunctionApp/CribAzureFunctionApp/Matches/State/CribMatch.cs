#nullable enable

using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.Scoring;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace CribAzureFunctionApp.Matches.State
{
    public class CribMatch
    {

        public CribMatch(
            MatchPlayer player1,
            MatchPlayer player2,
            MatchPlayer? player3,
            MatchPlayer? player4,
            CribGameState gameState,
            PlayingCard cutCard,
            List<PlayingCard> box,
            DealerDetails dealerDetails,
            Pegging pegging,
            List<Score> scores,
            string matchWinDeterminant,
            string id,
            ChangeHistory changeHistory,
            string title,
            ShowScoring? showScoring)
        {
            Player1 = player1;
            Player2 = player2;
            Player3 = player3;
            Player4 = player4;
            GameState = gameState;
            CutCard = cutCard;
            Box = box;
            DealerDetails = dealerDetails;
            Pegging = pegging;
            Scores = scores;
            MatchWinDeterminant = matchWinDeterminant;
            Id = id;
            ChangeHistory = changeHistory;
            Title = title;
            ShowScoring = showScoring;
        }

        [JsonProperty("id")]
        public string Id { get; }

        public MatchPlayer Player1 { get; }
        public MatchPlayer Player2 { get; }
        public MatchPlayer? Player3 { get; }
        public MatchPlayer? Player4 { get; }
        public CribGameState GameState { get; set; }
        public PlayingCard CutCard { get; set; }
        public List<PlayingCard> Box { get; set; }
        public DealerDetails DealerDetails { get; }
        public Pegging Pegging { get; }
        public List<Score> Scores { get; }
        public string MatchWinDeterminant { get; internal set; }
        public ChangeHistory ChangeHistory { get; internal set; }
        public string Title { get; }
        public ShowScoring? ShowScoring { get; internal set; }
    }

}