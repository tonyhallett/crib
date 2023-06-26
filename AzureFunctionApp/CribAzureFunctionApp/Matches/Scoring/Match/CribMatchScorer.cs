#nullable enable

using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.Scoring.Match.Utilities;
using CribAzureFunctionApp.Matches.Scoring.Scorer;
using CribAzureFunctionApp.Matches.Scoring.Scorer.Show;
using CribAzureFunctionApp.Matches.State;
using CribAzureFunctionApp.Matches.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CribAzureFunctionApp.Matches.Scoring.Match
{
    public class CribMatchScorer : ICribMatchScorer
    {
        public IScoreFinder scoreFinder;
        private readonly IScoreIncrementer scoreIncrementer;
        private readonly ICribScorer cribScorer;
        private readonly IHandReconstructor handReconstructor;

        public CribMatchScorer(IScoreFinder scoreFinder, IScoreIncrementer scoreIncrementer, ICribScorer cribScorer, IHandReconstructor handReconstructor)
        {
            this.scoreFinder = scoreFinder;
            this.scoreIncrementer = scoreIncrementer;
            this.cribScorer = cribScorer;
            this.handReconstructor = handReconstructor;
        }

        public bool ScoreCutCard(CribMatch match)
        {
            var gameWon = false;
            var cutCard = match.CutCard;
            if (cutCard.IsJack())
            {
                gameWon = Score(match, match.DealerDetails.Current, 2);
            }
            return gameWon;
        }

        private bool Score(CribMatch match, string playerId, int scoreIncrement)
        {
            var score = scoreFinder.Find(match, playerId);
            scoreIncrementer.Increment(score, scoreIncrement);
            return score.FrontPeg == 0;
        }


        public (PeggingResult, PegScoring) ScorePegging(
            CribMatch match, 
            List<PlayingCard> peggedCards, 
            bool peggingCompleted,
            string playerId
        )
        {
            var pegScoring = cribScorer.GetPegging(peggedCards, peggingCompleted);
            var gameWon = Score(match, playerId, pegScoring.Score);
            return (gameWon ? PeggingResult.GameWon : pegScoring.Is31 ? PeggingResult.ThirtyOne : PeggingResult.Continue, pegScoring);
        }

        public bool ScoreGo(CribMatch match, string playerId)
        {
            return Score(match, playerId, 1);
        }

        public bool ScoreShow(CribMatch match)
        {
            var players = match.GetPlayers();
            var dealer = players.First(p => p.Id == match.DealerDetails.Current);
            var playerHands = handReconstructor.Reconstruct(match.Pegging, dealer.Id, players.Select(p => p.Id).ToList());
            List<PlayingCard>? dealerHand = null;
            ShowScore? dealerHandScore = null;
            var gameWon = false;
            List<PlayerShowScore> playerShowScores = new();
            foreach (var handAndPlayer in playerHands)
            {
                var playerId = handAndPlayer.Item1;
                var hand = handAndPlayer.Item2.ToList();

                var showScore = cribScorer.GetShow(hand, match.CutCard, false);
                playerShowScores.Add(new PlayerShowScore(showScore, playerId));
                if (playerId == dealer.Id)
                {
                    dealerHand = hand;
                    dealerHandScore = showScore;
                }
                var player = players.First(p => p.Id == playerId);

                UpdateScoringHistory(
                    player.HandAndBoxScoringHistory.HandHistory,
                    showScore.Score,
                    () => new HighestScoringCards(showScore.Score, hand, match.CutCard)
                );


                gameWon = Score(match, playerId, showScore.Score);
                if (gameWon) return true;
            }
            ShowScore? boxScore = null;
            if (!gameWon)
            {
                boxScore = cribScorer.GetShow(match.Box, match.CutCard, true);
                var dealerScoringHistory = dealer.HandAndBoxScoringHistory;

                UpdateScoringHistory(
                    dealerScoringHistory.BoxHistory,
                    boxScore.Score,
                    () => new HighestScoringCards(boxScore.Score, match.Box, match.CutCard)
                );
                UpdateScoringHistory(
                    dealerScoringHistory.HandAndBoxHistory,
                    boxScore.Score + dealerHandScore!.Score,
                    () => new HandAndBoxHighestScoringCards(dealerHandScore.Score, boxScore.Score, dealerHand!, match.Box, match.CutCard)
                );
                gameWon = Score(match, dealer.Id, boxScore.Score);
            }
            match.ShowScoring = new ShowScoring(boxScore, playerShowScores);
            return gameWon;
        }

        private static void UpdateScoringHistory<T>(
            ScoringHistory<T> scoringHistory,
            int showScore,
            Func<T> highestScoringCardsCreator
        ) where T : IScoringCards
        {
            if (scoringHistory.NumScores == 0 || showScore > scoringHistory.HighestScoringCards!.Score)
            {
                scoringHistory.HighestScoringCards = highestScoringCardsCreator();
            }

            scoringHistory.NumScores++;
            scoringHistory.TotalScore += showScore;

        }

    }
}
