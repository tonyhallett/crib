#nullable enable

using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.Deal;
using CribAzureFunctionApp.Matches.Scoring;
using CribAzureFunctionApp.Matches.Scoring.Match;
using CribAzureFunctionApp.Matches.State;
using CribAzureFunctionApp.Matches.Utilities;
using CribAzureFunctionApp.Utilities;
using System.Collections.Generic;
using System.Linq;

namespace CribAzureFunctionApp.Matches.Change
{
    internal class MatchLogic : IMatchLogic
    {
        private readonly IMatchVerifier matchVerifier;
        private readonly ICribMatchScorer cribMatchScorer;
        private readonly INextPlayer nextPlayer;
        private readonly ICribDealer cribDealer;
        private readonly IDate date;

        public MatchLogic(
            IMatchVerifier matchVerifier,
            ICribMatchScorer cribMatchScorer,
            INextPlayer nextPlayer,
            ICribDealer cribDealer,
            IDate date
        )
        {
            this.matchVerifier = matchVerifier;
            this.cribMatchScorer = cribMatchScorer;
            this.nextPlayer = nextPlayer;
            this.cribDealer = cribDealer;
            this.date = date;
        }
        private void UpdateChangeHistory(CribMatch match)
        {
            match.ChangeHistory = match.ChangeHistory with { 
                LastChangeDate = date.UTCNow(), 
                NumberOfActions = match.ChangeHistory.NumberOfActions + 1 
            };
        }
        
        private static void PossiblyAdvanceToWinState(bool gameWon, CribMatch cribMatch)
        {
            if (gameWon)
            {
                cribMatch.GameState = IsMatchWon(cribMatch) ? CribGameState.MatchWon : CribGameState.GameWon;
            }
        }

        public void Discard(CribMatch match, string playerId, PlayingCard discard1, PlayingCard? discard2)
        {
            matchVerifier.VerifyDiscard(match, playerId, discard1, discard2);
            var playerCards =match.GetPlayerCards(playerId);
            DiscardToBox(playerCards, match.Box, discard1, discard2);
            UpdateChangeHistory(match);
            MoveToPeggingStateIfAllDiscarded(match);
        }

        private void MoveToPeggingStateIfAllDiscarded(CribMatch cribMatch)
        {
            if (cribMatch.Box.Count == 4)
            {
                cribMatch.GameState = CribGameState.Pegging;
                var gameWon = cribMatchScorer.ScoreCutCard(cribMatch);
                PossiblyAdvanceToWinState(gameWon, cribMatch);
            }
        }

        private static bool IsMatchWon(CribMatch cribMatch)
        {
            if (cribMatch.MatchWinDeterminant == "Unlimited")
            {
                return false;
            }

            var parts = cribMatch.MatchWinDeterminant.Split("_");
            var bestOfFirstTo = parts[0];
            var numGames = int.Parse(parts[1]);
            if (bestOfFirstTo == "BestOf")
            {
                return cribMatch.Scores.Any(score => BestOf(numGames, score.Games));
            }
            else
            {
                return cribMatch.Scores.Any(score => score.Games == numGames);
            }
        }

        private static bool BestOf(int bestOf, int gamesWon)
        {
            return gamesWon > (bestOf - 1) / 2;
        }

        private static void MoveToBox(List<PlayingCard> dealtCards, PlayingCard playingCard, List<PlayingCard> box)
        {
            dealtCards.Remove(playingCard);
            box.Add(playingCard);
        }

        private static void DiscardToBox(List<PlayingCard> dealtCards, List<PlayingCard> box, PlayingCard discard1, PlayingCard? discard2)
        {
            MoveToBox(dealtCards, discard1, box);

            if (discard2 != null)
            {
                MoveToBox(dealtCards, discard2, box);
            }
        }

        private void PeggingDoesNotWinGame(CribMatch match, bool is31, List<string> playerIds)
        {
            if (match.IsPeggingCompleted())
            {
                MoveToShowState(match);
            }
            else
            {
                if (is31)
                {
                    TurnOverCardsResetAllCanGo(match.Pegging);
                }
                match.Pegging.NextPlayer = nextPlayer.Get(match.Pegging.NextPlayer, playerIds, match.Pegging.CannotGoes);
            }
        }

        public void Peg(CribMatch match, string playerId, PlayingCard peggedCard)
        {
            matchVerifier.VerifyPegging(match, playerId, peggedCard);

            UpdateChangeHistory(match);

            var players = match.GetPlayers();
            var player = players.First(p => p.Id == playerId);
            var cards = player.Cards;
            var playerIds = players.Select(p => p.Id).ToList();

            cards.Remove(peggedCard);
            var isPeggingCompleted = match.IsPeggingCompleted();
            var peggedCards = match.Pegging.InPlayCards.Select(peggedCard => peggedCard.PlayingCard).Append(peggedCard).ToList();

            var (peggingResult, peggingScore) = cribMatchScorer.ScorePegging(match, peggedCards, isPeggingCompleted, playerId);
            match.Pegging.InPlayCards.Add(new PeggedCard(playerId, peggedCard, peggingScore));


            if (peggingResult == PeggingResult.GameWon)
            {
                PossiblyAdvanceToWinState(true, match);
            }
            else
            {
                PeggingDoesNotWinGame(match, peggingResult == PeggingResult.ThirtyOne, playerIds);
            }


        }

        private void MoveToShowState(CribMatch match)
        {
            match.GameState = CribGameState.Show;
            var gameWon = cribMatchScorer.ScoreShow(match);
            PossiblyAdvanceToWinState(gameWon, match);
        }

        //private static void MovePeggedCardToInPlayCards(List<PlayingCard> hand, List<PeggedCard> inPlayCards, PlayingCard peggedCard, string playerId)
        //{
        //    hand.Remove(peggedCard);
        //    inPlayCards.Add(new PeggedCard(playerId, peggedCard));
        //}

        private static void TurnOverCardsResetAllCanGo(Pegging pegging)
        {
            pegging.TurnedOverCards.AddRange(pegging.InPlayCards);
            pegging.InPlayCards.Clear();
            SetAllCanGo(pegging.CannotGoes);
        }

        private static void SetAllCanGo(List<bool> cannotGoes)
        {
            for (var i = 0; i < cannotGoes.Count; i++)
            {
                cannotGoes[i] = false;
            }
        }

        public void Go(CribMatch match, string playerId)
        {
            matchVerifier.VerifyGo(match, playerId);

            var players = match.GetPlayers();
            var playersCards = players.Select(p => p.Cards);
            var playerIndex = players.FindIndex(p => p.Id == playerId);
            var allCalledGo = players.All((player, i) =>
            {
                var isPlayer = player.Id == playerId;
                if (isPlayer) return true;
                return match.Pegging.CannotGoes[i];
            });

            AddToGoHistory(match.Pegging, playerId);

            if (allCalledGo)
            {
                var gameWon = cribMatchScorer.ScoreGo(match, playerId);
                TurnOverCardsResetAllCanGo(match.Pegging);
                PossiblyAdvanceToWinState(gameWon, match);
            }
            else
            {
                match.Pegging.CannotGoes[playerIndex] = true;
            }


            var nextPlayerId = nextPlayer.Get(playerId, players.Select(p => p.Id).ToList(), match.Pegging.CannotGoes);
            match.Pegging.NextPlayer = nextPlayerId;

            UpdateChangeHistory(match);
        }

        private static void AddToGoHistory(Pegging pegging, string playerId)
        {
            pegging.GoHistory.Add(new Go(playerId, pegging.InPlayCards.Count + pegging.TurnedOverCards.Count));
        }

        public void Ready(CribMatch match, string playerId)
        {
            matchVerifier.VerifyReady(match, playerId);

            var players = match.GetPlayers();
            var player = players.First(p => p.Id == playerId);
            player.Ready = true;
            var allReady = players.All(p => p.Ready);
            if (allReady)
            {
                switch (match.GameState)
                {
                    case CribGameState.Show:
                        ReadyForNextStage(match, false);
                        break;
                    case CribGameState.GameWon:
                        ReadyForNextStage(match, true);
                        break;
                        // todo
                        //case CribGameState.MatchWon:
                        //    CompleteWonMatch(match); 
                        //    break;
                }
            }

            UpdateChangeHistory(match);
        }

        private void ReadyForNextStage(CribMatch match, bool gameWon)
        {
            var players = match.GetPlayers();
            DealNewCards(match, players.Count);
            ResetPlayerReadyState(players);
            SetPeggingForNextStage(match, players.Select(p => p.Id).ToList(), gameWon);
            match.ShowScoring = null;
            match.GameState = CribGameState.Discard;
        }

        private void SetPeggingForNextStage(CribMatch match, List<string> playerIds, bool gameWon)
        {
            ResetPegging(match.Pegging, playerIds.Count);
            match.Pegging.NextPlayer = nextPlayer.ForNextStage(gameWon, match.DealerDetails, playerIds);
            if (gameWon)
            {
                ResetPegs(match.Scores);
            }
        }

        private static void ResetPegging(Pegging pegging, int numPlayers)
        {
            pegging.InPlayCards.Clear();
            pegging.TurnedOverCards.Clear();
            pegging.CannotGoes = Pegging.AllCanGo(numPlayers);
            pegging.GoHistory.Clear();
        }

        private static void ResetPegs(List<Score> scores)
        {
            scores.ForEach(score =>
            {
                score.FrontPeg = 0;
                score.BackPeg = 0;
            });
        }

        private static void ResetPlayerReadyState(List<MatchPlayer> players)
        {
            players.ForEach(player => player.Ready = false);
        }

        private void DealNewCards(CribMatch match, int numPlayers)
        {
            var cribPlayingCards = cribDealer.Deal(numPlayers);
            match.CutCard = cribPlayingCards.CutCard;
            match.Box = cribPlayingCards.Box;
            match.Player1.Cards = cribPlayingCards.Player1Cards;
            match.Player2.Cards = cribPlayingCards.Player2Cards;
            if (match.Player3 != null)
            {
                match.Player3.Cards = cribPlayingCards.Player3Cards;
            }
            if (match.Player4 != null)
            {
                match.Player4.Cards = cribPlayingCards.Player4Cards;
            }
        }

        //private static void CompleteWonMatch(CribMatch match)
        //{
        //    // this can be deleted as this is a db delete op - and stats ?
        //}

    }
}
