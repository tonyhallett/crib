#nullable enable

using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.Scoring.Scorer.Show;
using CribAzureFunctionApp.Utilities;
using System.Collections.Generic;
using System.Linq;

namespace CribAzureFunctionApp.Matches.Scoring.Scorer
{
    public class CribScorer : ICribScorer
    {

        private readonly Permuter<PlayingCard> permuter = new();

        private static bool IsConsecutiveIncreasing(IEnumerable<int> ints)
        {
            int? value = null;
            foreach (var newValue in ints)
            {
                if (value != null && newValue - value != 1)
                {
                    return false;
                }
                value = newValue;
            }

            return true;
        }

        public PegScoring GetPegging(List<PlayingCard> playingCards, bool scoreLastGo)
        {
            var sum = playingCards.Sum(playingCard => playingCard.Value());

            var numCardsInRun = GetNumCardsInRun(playingCards);

            var numOfAKindCards = 0;
            if (numCardsInRun == 0)
            {
                numOfAKindCards += GetNumOfAKind(playingCards);
            }

            return new PegScoring(sum == 31, sum == 15, numCardsInRun, numOfAKindCards, scoreLastGo);
        }

        private static int GetNumOfAKind(List<PlayingCard> playingCards)
        {
            var sameCount = 0;
            Pips? pips = null;
            for (var i = playingCards.Count - 1; i >= 0; i--)
            {
                var card = playingCards[i];
                if (pips != null)
                {
                    if (card.Pips == pips)
                    {
                        sameCount += sameCount == 0 ? 2 : 1;
                    }
                    else
                    {
                        break;
                    }

                }
                pips = card.Pips;
            }
            return sameCount;
        }
        private static int GetNumCardsInRun(List<PlayingCard> playingCards)
        {
            if (playingCards.Count < 3)
            {
                return 0;
            }
            /*
                runs
                    three points for completing a run of three cards, regardless of the order in which they are laid (a 6, then a 4, then a 5 is a run of three even though they were not laid in order)
                    four points for completing a run of four
                    five points for completing a run of five
                    six points for completing a run of six
                    seven points for completing the run of seven; e.g. playing 2, 4, 6, A, 3, 5 and 7
            */

            // take the first, second and third - is it a run ? set the score to 3 but look on
            // or look at all of them
            var pips = playingCards.Select(playingCard => (int)playingCard.Pips).ToList();
            while (pips.Count >= 3)
            {
                var ordered = pips.OrderBy(pips => pips).ToList();
                if (IsConsecutiveIncreasing(ordered))
                {
                    return ordered.Count;
                }
                pips.RemoveAt(0);
            }
            return 0;
        }

        public ShowScore GetShow(List<PlayingCard> handOrBox, PlayingCard cutCard, bool isBox)
        {
            var showScores = new ShowScore();
            var flush = GetFlush(handOrBox, cutCard, isBox);
            showScores.Flush = flush;
            showScores.OneForHisKnob = OneForHisKnob(handOrBox, cutCard);

            // ordering is important for runs
            var allCardsOrderedByPips = handOrBox.Append(cutCard).OrderBy(card => card.Pips).ToList();
            showScores.FifteenTwos = FifteenTwos(allCardsOrderedByPips);
            showScores.Runs = Runs(allCardsOrderedByPips);

            var checkOfAKind = flush.Count != 5;
            if (checkOfAKind)
            {
                AddOfAKind(allCardsOrderedByPips, showScores);
            }
            return showScores;
        }

        private void AddOfAKind(List<PlayingCard> cards, ShowScore showScores)
        {
            var groupedByOfAKind = cards.GroupBy(playingCard => playingCard.Pips);
            foreach (var grouping in groupedByOfAKind)
            {
                var ofAKindCards = grouping.ToList();
                switch (ofAKindCards.Count)
                {
                    case 2:
                        showScores.Pairs.Add(new Pair(ofAKindCards[0], ofAKindCards[1]));
                        break;
                    case 3:
                        showScores.ThreeOfAKind = new ThreeOfAKind(ofAKindCards[0], ofAKindCards[1], ofAKindCards[2]);
                        break;
                    case 4:
                        showScores.FourOfAKind = new FourOfAKind(ofAKindCards[0], ofAKindCards[1], ofAKindCards[2], ofAKindCards[3]);
                        break;
                }
            }
        }

        private List<List<PlayingCard>> Runs(List<PlayingCard> allCardsOrderedByPips)
        {
            if (IsRun(allCardsOrderedByPips))
            {
                return new List<List<PlayingCard>> { allCardsOrderedByPips };
            }

            var fourCardPermutations = permuter.Permute(allCardsOrderedByPips, 4);


            var fourCardRuns = fourCardPermutations.Where(IsRun).ToList();
            if (fourCardRuns.Any())
            {
                return fourCardRuns; // e.g given 2,3,4,5 as four card run - if additional card is Ace or 6 then it is a 5 card run. If is 2,3,4,5 then is another 4 card run
            }

            return permuter.Permute(allCardsOrderedByPips, 3).Where(IsRun).ToList();
        }

        private bool IsRun(List<PlayingCard> sortedCards)
        {
            var lastCardPips = sortedCards[0].Pips;
            for (var i = 1; i < sortedCards.Count; i++)
            {
                var nextCardPips = sortedCards[i].Pips;
                if (nextCardPips - lastCardPips != 1)
                {
                    return false;
                }
                lastCardPips = nextCardPips;
            }
            return true;
        }

        internal List<List<PlayingCard>> FifteenTwos(List<PlayingCard> allCards)
        {
            if (SumsToFifteen(allCards))
            {
                return new List<List<PlayingCard>> { allCards.ToList() };
            }
            var permutations = new List<int> { 4, 3, 2 }.SelectMany(numCards => permuter.Permute(allCards, numCards));
            return permutations.Where(permutation => SumsToFifteen(permutation)).ToList();
        }

        private static bool SumsToFifteen(IEnumerable<PlayingCard> cards)
        {
            return cards.Sum(c => c.Value()) == 15;
        }

        internal static List<PlayingCard> GetFlush(List<PlayingCard> handOrBox, PlayingCard cutCard, bool isBox)
        {
            if (isBox)
            {
                if (handOrBox.All(card => card.Suit == cutCard.Suit))
                {
                    return handOrBox.Append(cutCard).ToList();
                }
            }
            else
            {
                var suit = handOrBox[0].Suit;
                var allSameSuit = handOrBox.All(card => card.Suit == suit);
                if (allSameSuit)
                {
                    if (cutCard.Suit == suit)
                    {
                        return handOrBox.Append(cutCard).ToList();
                    }
                    return handOrBox;
                }

            }
            return new List<PlayingCard>();

        }

        internal static PlayingCard? OneForHisKnob(List<PlayingCard> handOrBox, PlayingCard cutCard)
        {
            var jack = handOrBox.FirstOrDefault(card => card.Pips == Pips.Jack && card.Suit == cutCard.Suit);
            return jack;
        }
    }

}