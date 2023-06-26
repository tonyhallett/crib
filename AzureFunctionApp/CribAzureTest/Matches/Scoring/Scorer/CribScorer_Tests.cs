using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.Scoring.Scorer;
using CribAzureFunctionApp.Matches.Scoring.Scorer.Show;
using CribAzureTest.TestHelpers;
using System.Collections;

namespace CribAzureTest.Matches.Scoring.Scorer
{
    internal class CribScorer_Tests
    {
        public class ScorerPeggingCases : IEnumerable
        {
            private PegScoring NoScore = new PegScoring(false, false, 0, 0, false);
            private PegScoring FifteenTwoOnly = new PegScoring(false, true, 0, 0, false);
            public IEnumerator GetEnumerator()
            {
                yield return new TestCaseData(new List<PlayingCard>(), NoScore, false).SetName("no cards, no score");
                yield return new TestCaseData(new List<PlayingCard> { Cards.AceDiamonds }, NoScore, false).SetName("one card, no score");
                yield return new TestCaseData(new List<PlayingCard> { Cards.KingHearts, Cards.FiveDiamonds }, FifteenTwoOnly, false).SetName("two cards, fifteen");
                yield return new TestCaseData(new List<PlayingCard> { Cards.FiveDiamonds, Cards.KingHearts }, FifteenTwoOnly, false).SetName("two cards reversed order, fifteen");
                yield return new TestCaseData(new List<PlayingCard> { Cards.FiveSpades, Cards.ThreeSpades, Cards.SevenSpades }, FifteenTwoOnly, false).SetName("three cards, fifteen");
                yield return new TestCaseData(new List<PlayingCard> { Cards.FiveDiamonds, Cards.KingHearts, Cards.AceDiamonds }, NoScore, false).SetName("fifteen two consecutive but not last - 0 score");
                yield return new TestCaseData(new List<PlayingCard> { Cards.FiveSpades, Cards.AceSpades, Cards.SixSpades, Cards.TwoSpades, Cards.ThreeSpades, Cards.FourSpades }, new PegScoring(false, false, 6, 0, false), false).SetName("6 card run not consecutive");
                yield return new TestCaseData(new List<PlayingCard> { Cards.AceSpades, Cards.SixSpades, Cards.TwoSpades, Cards.ThreeSpades, Cards.FourSpades }, new PegScoring(false, false, 3, 0, false), false).SetName("3 card run, 4 blocked by intermediate");
                yield return new TestCaseData(new List<PlayingCard> { Cards.FiveSpades, Cards.FourSpades, Cards.SixSpades }, new PegScoring(false, true, 3, 0, false), false).SetName("3 card run and fifteen");
                yield return new TestCaseData(new List<PlayingCard> { Cards.JackHearts, Cards.QueenHearts, Cards.KingHearts, Cards.AceHearts }, new PegScoring(true, false, 0, 0, false), false).SetName("31");
                yield return new TestCaseData(new List<PlayingCard> { Cards.TenHearts, Cards.KingClubs, Cards.QueenClubs }, new PegScoring(false, false, 0, 0, true), true).SetName("Score last go");
                yield return new TestCaseData(new List<PlayingCard> { Cards.TenHearts, Cards.KingClubs, Cards.QueenClubs }, new PegScoring(false, false, 0, 0, false), false).SetName("Do not Score last go - 0");
                yield return new TestCaseData(new List<PlayingCard> { Cards.TwoClubs, Cards.TwoDiamonds }, new PegScoring(false, false, 0, 2, false), false).SetName("Pair for 2");
                yield return new TestCaseData(new List<PlayingCard> { Cards.TwoClubs, Cards.TwoDiamonds, Cards.TwoSpades }, new PegScoring(false, false, 0, 3, false), false).SetName("Three of a kind");
                yield return new TestCaseData(new List<PlayingCard> { Cards.TwoClubs, Cards.TwoDiamonds, Cards.TwoSpades, Cards.TwoHearts }, new PegScoring(false, false, 0, 4, false), false).SetName("Four of a kind");
                yield return new TestCaseData(new List<PlayingCard> { Cards.JackClubs, Cards.TwoClubs, Cards.TwoDiamonds, Cards.TwoSpades, Cards.TwoHearts }, new PegScoring(false, false, 0, 4, false), false).SetName("Four of a kind with preceeding");
                yield return new TestCaseData(new List<PlayingCard> { Cards.TwoClubs, Cards.TwoDiamonds, Cards.TwoSpades, Cards.TwoHearts, Cards.FourClubs }, NoScore, false).SetName("Ignores preceeding four of a kind");
                yield return new TestCaseData(new List<PlayingCard> { Cards.FourClubs, Cards.FourDiamonds, Cards.TwoClubs, Cards.TwoDiamonds, Cards.TwoSpades, Cards.TwoHearts }, new PegScoring(false, false, 0, 4, false), false).SetName("Four of a kind when preceeding");
            }
        }

        [TestCaseSource(typeof(ScorerPeggingCases))]
        public void Should_Score_Pegging_Correctly(List<PlayingCard> cards, PegScoring expectedScoring, bool scoreLast)
        {
            var cribScorer = new CribScorer();
            Assert.That(cribScorer.GetPegging(cards, scoreLast), Is.EqualTo(expectedScoring));
        }

        public class FlushCases : IEnumerable
        {
            public IEnumerator GetEnumerator()
            {
                var sameSuit = new List<PlayingCard> { Cards.AceClubs, Cards.TwoClubs, Cards.ThreeClubs, Cards.FourClubs };
                var expectedAll = sameSuit.Append(Cards.FiveClubs).ToList();
                var expectedNotAFlush = new List<PlayingCard> { };
                yield return new TestCaseData(sameSuit, Cards.FiveClubs, true, expectedAll).SetName("Box and cut card same suit");
                yield return new TestCaseData(sameSuit, Cards.FiveSpades, true, expectedNotAFlush).SetName("Only Box same suit");
                yield return new TestCaseData(sameSuit, Cards.FiveClubs, false, expectedAll).SetName("Hand and cut card same suit");
                yield return new TestCaseData(sameSuit, Cards.FiveSpades, false, sameSuit).SetName("Hand only same suit");
                yield return new TestCaseData(new List<PlayingCard> { Cards.AceClubs, Cards.TwoClubs, Cards.ThreeClubs, Cards.FourHearts }, Cards.FiveClubs, false, expectedNotAFlush).SetName("Hand not same suit");

            }

        }



        [TestCaseSource(typeof(FlushCases))]
        public void Should_Find_Flushes(List<PlayingCard> handOrBox, PlayingCard cutCard, bool isBox, List<PlayingCard> expected)
        {
            Assert.That(CribScorer.GetFlush(handOrBox, cutCard, isBox), Is.EqualTo(expected));
        }

        public class OneForHisKnobTestCaes : IEnumerable
        {
            public IEnumerator GetEnumerator()
            {
                yield return new TestCaseData(new List<PlayingCard> { Cards.TenDiamonds, Cards.JackSpades, Cards.JackDiamonds, Cards.JackHearts }, Cards.AceDiamonds, Cards.JackDiamonds).SetName("One for his knob");
                yield return new TestCaseData(new List<PlayingCard> { Cards.TenDiamonds, Cards.JackSpades, Cards.JackDiamonds, Cards.JackHearts }, Cards.JackClubs, null).SetName("Not one for his knob");
            }
        }

        [TestCaseSource(typeof(OneForHisKnobTestCaes))]
        public void Should_Find_One_For_His_Knob(List<PlayingCard> handOrBox, PlayingCard cutCard, PlayingCard? expectedOneForHisKnob)
        {
            var cutCardIsOneForHisKnob = CribScorer.OneForHisKnob(handOrBox, cutCard);
            Assert.That(cutCardIsOneForHisKnob, Is.EqualTo(expectedOneForHisKnob));
        }

        public class ScoreShowCases : IEnumerable
        {
            public IEnumerator GetEnumerator()
            {

                yield return new TestCaseData(
                    new List<PlayingCard> {
                        Cards.TwoClubs, Cards.JackHearts, Cards.KingHearts, Cards.FourSpades
                    },
                    Cards.SixDiamonds,
                    false,
                    new ShowScore()
                ).SetName("19");

                #region of a kind
                yield return new TestCaseData(
                    new List<PlayingCard> { Cards.TwoClubs, Cards.JackHearts, Cards.KingHearts, Cards.FourSpades },
                    Cards.TwoDiamonds,
                    false,
                    new ShowScore() { Pairs = new List<Pair> { new Pair(Cards.TwoClubs, Cards.TwoDiamonds) } }
                ).SetName("Single pair with cut card");
                yield return new TestCaseData(
                    new List<PlayingCard> { Cards.TwoClubs, Cards.TwoHearts, Cards.KingHearts, Cards.FourSpades },
                    Cards.SixDiamonds,
                    false,
                    new ShowScore() { Pairs = new List<Pair> { new Pair(Cards.TwoClubs, Cards.TwoHearts) } }
                ).SetName("Single pair");
                yield return new TestCaseData(
                    new List<PlayingCard> { Cards.TwoClubs, Cards.TwoHearts, Cards.TwoSpades, Cards.FourSpades },
                    Cards.SixDiamonds,
                    false,
                    new ShowScore() { ThreeOfAKind = new ThreeOfAKind(Cards.TwoClubs, Cards.TwoHearts, Cards.TwoSpades) }
                ).SetName("Three of a kind");
                yield return new TestCaseData(
                    new List<PlayingCard> { Cards.TwoClubs, Cards.TwoHearts, Cards.TwoSpades, Cards.TwoDiamonds },
                    Cards.FourDiamonds,
                    false,
                    new ShowScore() { FourOfAKind = new FourOfAKind(Cards.TwoClubs, Cards.TwoHearts, Cards.TwoSpades, Cards.TwoDiamonds) }
                ).SetName("Four of a kind");
                yield return new TestCaseData(
                    new List<PlayingCard> { Cards.TwoClubs, Cards.TwoHearts, Cards.KingHearts, Cards.SixSpades },
                    Cards.SixDiamonds,
                    false,
                    new ShowScore() { Pairs = new List<Pair> { new Pair(Cards.TwoClubs, Cards.TwoHearts), new Pair(Cards.SixSpades, Cards.SixDiamonds) } }
                ).SetName("Two pair");
                yield return new TestCaseData(
                    new List<PlayingCard> { Cards.TwoClubs, Cards.TwoHearts, Cards.TwoDiamonds, Cards.SixSpades },
                    Cards.SixDiamonds,
                    false,
                    new ShowScore() { Pairs = new List<Pair> { new Pair(Cards.SixSpades, Cards.SixDiamonds) }, ThreeOfAKind = new ThreeOfAKind(Cards.TwoClubs, Cards.TwoHearts, Cards.TwoDiamonds) }
                ).SetName("Two pair and three of a kind");
                #endregion

                #region flush
                var sameSuit = new List<PlayingCard> { Cards.KingClubs, Cards.QueenClubs, Cards.TenClubs, Cards.NineClubs };
                yield return new TestCaseData(
                    sameSuit,
                    Cards.FourClubs,
                    true,
                    new ShowScore() { Flush = new List<PlayingCard> { Cards.KingClubs, Cards.QueenClubs, Cards.TenClubs, Cards.NineClubs, Cards.FourClubs } }
                ).SetName("Box and cut card same suit");
                yield return new TestCaseData(
                    sameSuit,
                    Cards.FourSpades,
                    true,
                    new ShowScore()
                ).SetName("Only Box same suit");
                yield return new TestCaseData(
                    sameSuit,
                    Cards.FourClubs,
                    false,
                    new ShowScore() { Flush = new List<PlayingCard> { Cards.KingClubs, Cards.QueenClubs, Cards.TenClubs, Cards.NineClubs, Cards.FourClubs } }
                ).SetName("Hand and cut card same suit");
                yield return new TestCaseData(
                    sameSuit,
                    Cards.FourSpades,
                    false,
                    new ShowScore() { Flush = new List<PlayingCard> { Cards.KingClubs, Cards.QueenClubs, Cards.TenClubs, Cards.NineClubs } }
                ).SetName("Hand only same suit");
                yield return new TestCaseData(
                    new List<PlayingCard> { Cards.KingClubs, Cards.QueenClubs, Cards.TenHearts, Cards.NineClubs },
                    Cards.FourClubs,
                    false,
                    new ShowScore()
                ).SetName("Hand not same suit");
                #endregion

                #region one for his knob
                yield return new TestCaseData(
                    new List<PlayingCard> { Cards.AceClubs, Cards.SevenSpades, Cards.JackDiamonds, Cards.QueenHearts }, Cards.TwoDiamonds,
                    false,
                    new ShowScore() { OneForHisKnob = Cards.JackDiamonds }).SetName("One for his knob");
                yield return new TestCaseData(
                    new List<PlayingCard> { Cards.AceClubs, Cards.SevenSpades, Cards.TwoClubs, Cards.QueenHearts },
                    Cards.JackClubs,
                    false,
                    new ShowScore()
                ).SetName("Not one for his knob");
                #endregion

                #region fifteen two
                yield return new TestCaseData(
                    new List<PlayingCard> { Cards.TenDiamonds, Cards.FiveSpades, Cards.AceClubs, Cards.TwoClubs },
                    Cards.SixHearts,
                    false,
                    new ShowScore() { FifteenTwos = new List<List<PlayingCard>> { new List<PlayingCard> { Cards.FiveSpades, Cards.TenDiamonds, } } }
                ).SetName("Two card fifteen two");
                yield return new TestCaseData(
                    new List<PlayingCard> { Cards.TenDiamonds, Cards.FiveSpades, Cards.AceClubs, Cards.TwoClubs },
                    Cards.SevenHearts,
                    false,
                    new ShowScore()
                    {
                        FifteenTwos = new List<List<PlayingCard>> {
                        new List<PlayingCard> { Cards.FiveSpades, Cards.AceClubs, Cards.TwoClubs, Cards.SevenHearts },
                        new List<PlayingCard> { Cards.FiveSpades, Cards.TenDiamonds },
                    }
                    }
                ).SetName("Two card fifteen two, 4 card fifteen four");
                yield return new TestCaseData(
                    new List<PlayingCard> { Cards.ThreeDiamonds, Cards.FiveSpades, Cards.AceClubs, Cards.TwoClubs },
                    Cards.FourHearts,
                    false,
                    new ShowScore()
                    {
                        FifteenTwos = new List<List<PlayingCard>> {
                            new List<PlayingCard> { Cards.ThreeDiamonds, Cards.FiveSpades, Cards.AceClubs, Cards.TwoClubs, Cards.FourHearts }
                        },
                        Runs = new List<List<PlayingCard>>
                        {
                            new List<PlayingCard> { Cards.ThreeDiamonds, Cards.FiveSpades, Cards.AceClubs, Cards.TwoClubs, Cards.FourHearts }
                        }

                    }).SetName("Five card fifteen two and five card run");
                #endregion

                #region runs
                yield return new TestCaseData(
                    new List<PlayingCard> { Cards.KingClubs, Cards.QueenDiamonds, Cards.TenHearts, Cards.NineClubs },
                    Cards.TwoHearts, false, new ShowScore()).SetName("Nothing for run of 2");
                yield return new TestCaseData(
                    new List<PlayingCard> { Cards.KingClubs, Cards.QueenDiamonds, Cards.JackDiamonds, Cards.NineClubs },
                    Cards.TwoHearts, false,
                    new ShowScore() { Runs = new List<List<PlayingCard>> { new List<PlayingCard> { Cards.KingClubs, Cards.QueenDiamonds, Cards.JackDiamonds } } }
                ).SetName("Run of 3");
                yield return new TestCaseData(
                    new List<PlayingCard> { Cards.KingClubs, Cards.QueenDiamonds, Cards.JackDiamonds, Cards.TenClubs },
                    Cards.TwoHearts,
                    false,
                    new ShowScore()
                    {
                        Runs = new List<List<PlayingCard>> { new List<PlayingCard> { Cards.KingClubs, Cards.QueenDiamonds, Cards.JackDiamonds, Cards.TenClubs } }
                    }
                ).SetName("Run of 4");
                yield return new TestCaseData(
                    new List<PlayingCard> { Cards.KingClubs, Cards.QueenDiamonds, Cards.JackDiamonds, Cards.TenClubs },
                    Cards.NineHearts,
                    false,
                    new ShowScore()
                    {
                        Runs = new List<List<PlayingCard>> { new List<PlayingCard> { Cards.KingClubs, Cards.QueenDiamonds, Cards.JackDiamonds, Cards.TenClubs, Cards.NineHearts } }
                    }).SetName("Run of 5");
                yield return new TestCaseData(
                    new List<PlayingCard> { Cards.KingClubs, Cards.QueenDiamonds, Cards.JackDiamonds, Cards.TenClubs },
                    Cards.TenSpades, false,
                    new ShowScore()
                    {
                        Pairs = new List<Pair> { new Pair(Cards.TenClubs, Cards.TenSpades) },
                        Runs = new List<List<PlayingCard>>
                        {
                            new List<PlayingCard>{Cards.KingClubs, Cards.QueenDiamonds, Cards.JackDiamonds, Cards.TenClubs },
                            new List<PlayingCard>{ Cards.KingClubs, Cards.QueenDiamonds, Cards.JackDiamonds, Cards.TenSpades }
                        }
                    }
                ).SetName("Two Runs of 4 and a pair");
                yield return new TestCaseData(
                    new List<PlayingCard> { Cards.KingClubs, Cards.QueenDiamonds, Cards.JackDiamonds, Cards.JackClubs },
                    Cards.TwoHearts,
                    false,
                    new ShowScore()
                    {
                        Pairs = new List<Pair> { new Pair(Cards.JackDiamonds, Cards.JackClubs) },
                        Runs = new List<List<PlayingCard>>
                        {
                            new List<PlayingCard>{ Cards.KingClubs, Cards.QueenDiamonds, Cards.JackDiamonds },
                            new List<PlayingCard>{ Cards.KingClubs, Cards.QueenDiamonds, Cards.JackClubs }
                        }

                    }
                ).SetName("Two Runs of 3 and a pair");
                yield return new TestCaseData(
                    new List<PlayingCard> { Cards.KingClubs, Cards.QueenDiamonds, Cards.JackDiamonds, Cards.JackClubs },
                    Cards.JackHearts,
                    false,
                    new ShowScore()
                    {
                        ThreeOfAKind = new ThreeOfAKind(Cards.JackDiamonds, Cards.JackClubs, Cards.JackHearts),
                        Runs = new List<List<PlayingCard>>
                        {
                            new List<PlayingCard>{ Cards.KingClubs, Cards.QueenDiamonds, Cards.JackDiamonds },
                            new List<PlayingCard>{ Cards.KingClubs, Cards.QueenDiamonds, Cards.JackClubs },
                            new List<PlayingCard>{ Cards.KingClubs, Cards.QueenDiamonds, Cards.JackHearts }
                        }

                    }
                ).SetName("Three Runs of 3 and three of a kind");
                #endregion

            }
        }

        [TestCaseSource(typeof(ScoreShowCases))]
        public void Should_ScoreShow_Correctly(List<PlayingCard> handOrBox, PlayingCard cutCard, bool isBox, ShowScore expectedShowScore)
        {
            var cribScorer = new CribScorer();
            Assert.That(cribScorer.GetShow(handOrBox, cutCard, isBox).IsEqualTo(expectedShowScore), Is.True);
        }
    }

    public static class ShowScoreTestEquality
    {
        public static bool IsEqualTo(this ShowScore score1, ShowScore other)
        {
            if (other == null)
            {
                return false;
            }
            return score1.OneForHisKnob == other.OneForHisKnob &&
                   score1.Pairs.SequenceEqual(other.Pairs) &&
                   score1.ThreeOfAKind == other.ThreeOfAKind &&
                   score1.FourOfAKind == other.FourOfAKind &&
                   ListOfPlayingCardListsEqual(score1.Runs, other.Runs) &&
                   ListOfPlayingCardListsEqual(score1.FifteenTwos, other.FifteenTwos) &&
                   score1.Flush.SequenceEqual(other.Flush);
        }

        private static int ComparePlayingCards(PlayingCard first, PlayingCard second)
        {
            var order = first.Suit - second.Suit;
            if (order == 0)
            {
                order = first.Pips - second.Pips;
            }
            return order;
        }

        private static bool ListOfPlayingCardListsEqual(List<List<PlayingCard>> first, List<List<PlayingCard>> second)
        {
            if (first.Count != second.Count)
            {
                return false;
            }

            for (var i = 0; i < first.Count; i++)
            {
                first[i].Sort(ComparePlayingCards);
                second[i].Sort(ComparePlayingCards);

                var same = first[i].SequenceEqual(second[i]);

                if (!same) return false;
            }
            return true;
        }
    }
}
