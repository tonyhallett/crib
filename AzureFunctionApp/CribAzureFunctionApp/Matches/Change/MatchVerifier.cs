#nullable enable

using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.State;
using CribAzureFunctionApp.Matches.Utilities;
using CribAzureFunctionApp.Verification;
using System.Collections.Generic;
using System.Linq;

namespace CribAzureFunctionApp.Matches.Change
{
    public class MatchVerifier : IMatchVerifier
    {
        private static MatchPlayer VerifyIsAPlayerInMatch(IEnumerable<MatchPlayer> players, string playerIdToVerify)
        {
            var player = players.FirstOrDefault(p => p.Id == playerIdToVerify) ?? throw new JsHackingException("Not a player");
            return player;
        }

        private static void VerifyGameState(CribGameState expectedGameState, CribGameState gameState, string reason)
        {
            if (expectedGameState != gameState)
            {
                throw new JsHackingException($"Cannot {reason} when game state is {gameState}");
            }
        }

        private static void VerifyCardIsInHand(List<PlayingCard> cards, PlayingCard card)
        {
            if (!cards.Contains(card))
            {
                throw new JsHackingException($"Card {card.Pips}{card.Suit} is not your card");
            }
        }

        private static void VerifyDiscardCount(int numPlayers, int numDiscards)
        {
            var expectedNumberOfDiscards = numPlayers == 2 ? 2 : 1;
            var expectedDiscardOrDiscards = expectedNumberOfDiscards == 1 ? "discard" : "discards";
            if (expectedNumberOfDiscards != numDiscards)
            {
                throw new JsHackingException($"Expected {expectedNumberOfDiscards} {expectedDiscardOrDiscards}");
            }
        }

        private static void VerifyDiscardsInHand(List<PlayingCard> cards, PlayingCard discard1, PlayingCard? discard2)
        {
            VerifyCardIsInHand(cards, discard1);
            if (discard2 != null)
            {
                VerifyCardIsInHand(cards, discard2);
            }
        }


        public void VerifyDiscard(CribMatch match, string playerId, PlayingCard discard1, PlayingCard? discard2)
        {
            var players = match.GetPlayers();
            var player = VerifyIsAPlayerInMatch(players, playerId);
            VerifyGameState(CribGameState.Discard, match.GameState, "discard");
            VerifyDiscardCount(players.Count, discard2 == null ? 1 : 2);
            VerifyDiscardsInHand(player.Cards, discard1, discard2);
        }

        public void VerifyGo(CribMatch match, string playerId)
        {
            var players = match.GetPlayers();
            var player = VerifyIsAPlayerInMatch(players, playerId);
            VerifyIsNextPlayer(match.Pegging.NextPlayer, playerId);
            VerifyGameState(CribGameState.Pegging, match.GameState, "peg");
            VerifyCanCallGo(match.Pegging.InPlayCards, player.Cards);
        }

        private static void VerifyCanCallGo(List<PeggedCard> inPlayCards, List<PlayingCard> cards)
        {
            var inPlaySum = GetInPlaySum(inPlayCards);
            var anyCanPlay = cards.Any(card => card.Value() + inPlaySum < 31);
            if (anyCanPlay)
            {
                throw new JsHackingException("You can go");
            }

        }

        public void VerifyPegging(CribMatch match, string playerId, PlayingCard pegCard)
        {
            var players = match.GetPlayers();
            var player = VerifyIsAPlayerInMatch(players, playerId);
            VerifyIsNextPlayer(match.Pegging.NextPlayer, playerId);
            VerifyGameState(CribGameState.Pegging, match.GameState, "peg");
            VerifyCardIsInHand(player.Cards, pegCard);
            VerifyPeggingGreaterThan31(match.Pegging.InPlayCards, pegCard);
        }

        private static void VerifyPeggingGreaterThan31(List<PeggedCard> inPlayCards, PlayingCard pegCard)
        {
            var sum = GetInPlaySum(inPlayCards) + pegCard.Value();
            if (sum > 31)
            {
                throw new JsHackingException("Pegging more than 31");
            }
        }

        private static int GetInPlaySum(List<PeggedCard> inPlayCards)
        {
            return inPlayCards.Sum(peggingCard => peggingCard.PlayingCard.Value());
        }

        private static void VerifyIsNextPlayer(string nextPlayer, string player)
        {
            if (nextPlayer != player)
            {
                throw new JsHackingException("You are not the next player");
            }
        }

        public void VerifyReady(CribMatch match, string playerId)
        {
            VerifyIsAPlayerInMatch(match.GetPlayers(), playerId);
            VerifyInReadyState(match.GameState);
        }

        private static void VerifyInReadyState(CribGameState gameState)
        {
            if (!(gameState is CribGameState.Show or CribGameState.GameWon or CribGameState.MatchWon))
            {
                throw new JsHackingException("Not in a ready state");
            }
        }
    }
}
