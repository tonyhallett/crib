using Moq;
using System.Collections;
using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.State;
using CribAzureFunctionApp.Matches.Scoring.Match.Utilities;
using CribAzureFunctionApp.Matches.Scoring.Scorer.Show;
using CribAzureFunctionApp.Matches.Scoring.Scorer;
using CribAzureFunctionApp.Matches.Scoring;
using CribAzureFunctionApp.Matches.Scoring.Match;
using CribAzureTest.TestHelpers;

namespace CribAzureTest.Matches.Scoring.Match
{
    internal class CribMatchScorer_Tests
    {
        [TestCase(0,0,0, 0,0,0, false)]
        [TestCase(0, 0, 0, 0, 2, 0, false)]
        [TestCase(0, 0, 0, 1, 0, 0, true)]
        public void Score_Should_Return_Game_Won_When_Games_Incremented(int initialGames,int initialFrontPeg, int initialBackPeg, int incrementedGames,int incrementedFrontPeg, int incrementedBackPeg,bool expectedGameWon)
        {
            CribMatch cribMatch = new CribMatch(Empty.MatchPlayer(""),Empty.MatchPlayer(""),null,null, CribGameState.Show,Cards.AceClubs,Empty.Cards, Empty.DealerDetails,Empty.Pegging,Empty.Scores,"","",Empty.ChangeHistory,"",null);
            var mockScoreFinder = new Mock<IScoreFinder>();
            var score = new Score(initialGames, initialFrontPeg, initialBackPeg);
            mockScoreFinder.Setup(scoreFinder => scoreFinder.Find(It.IsAny<CribMatch>(), It.IsAny<string>())).Returns(score);
            var mockScoreIncrementer = new Mock<IScoreIncrementer>();
            var scoreIncrement = 0;
            mockScoreIncrementer.Setup(scoreIncrementer => scoreIncrementer.Increment(score, scoreIncrement)).Callback(() =>
            {
                score.Games = incrementedGames;
                score.FrontPeg = incrementedFrontPeg;
                score.BackPeg = incrementedBackPeg;
            });
            var cribMatchScorer = new CribMatchScorer(mockScoreFinder.Object, mockScoreIncrementer.Object,new Mock<ICribScorer>().Object, new Mock<IHandReconstructor>().Object);

            var gameWon = cribMatchScorer.Score(cribMatch, "", scoreIncrement);
            Assert.That(gameWon, Is.EqualTo(expectedGameWon));
        }

        [Test]
        public void ScoreCutCard_Should_Not_Change_Score_If_Not_A_Jack()
        {
            var mockScoreIncrementer = new Mock<IScoreIncrementer>(MockBehavior.Strict);
            var cribMatchScorer = new CribMatchScorer(new Mock<IScoreFinder>().Object, mockScoreIncrementer.Object, new Mock<ICribScorer>().Object, new Mock<IHandReconstructor>().Object);

            cribMatchScorer.ScoreCutCard(
                new CribMatch(
                    Empty.MatchPlayer(""),
                    Empty.MatchPlayer(""),
                    null,
                    null,
                    CribGameState.Discard,
                    Cards.AceSpades,
                    Empty.Cards,
                    Empty.DealerDetails,
                    Empty.Pegging,
                    Empty.Scores,
                    "3", "id", Empty.ChangeHistory, "", null));
        }

        [Test]
        public void ScoreCutCard_Should_Increment_Dealer_Player_Or_Team_Score_By_Two_When_Is_A_Jack()
        {
            var match = new CribMatch(
                Empty.MatchPlayer(""),
                Empty.MatchPlayer(""),
                null,
                null,
                CribGameState.Discard,
                Cards.JackHearts,
                Empty.Cards,
                new DealerDetails("", "dealerid"),
                Empty.Pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null);
            var mockScoreIncrementer = new Mock<IScoreIncrementer>();

            var mockScoreFinder = new Mock<IScoreFinder>();
            var teamOrPlayerScore = new Score(1, 2, 3);
            mockScoreFinder.Setup(scoreFinder => scoreFinder.Find(match, "dealerid")).Returns(teamOrPlayerScore);

            var cribMatchScorer = new CribMatchScorer(mockScoreFinder.Object, mockScoreIncrementer.Object, new Mock<ICribScorer>().Object, new Mock<IHandReconstructor>().Object);

            cribMatchScorer.ScoreCutCard(match);

            mockScoreIncrementer.Verify(scoreIncrementer => scoreIncrementer.Increment(teamOrPlayerScore, 2));
        }

        [TestCase(true)]
        [TestCase(false)]
        public void ScorePegging_Should_Increment_Player_Or_Team_Score_By_Pegging_Score(bool pegged31)
        {
            var inPlayCards = new List<PeggedCard> { new PeggedCard("owner", Cards.AceHearts, Empty.PegScoring) };
            var match = new CribMatch(
                Empty.MatchPlayer(""), Empty.MatchPlayer(""), null, null, CribGameState.Discard, Cards.JackHearts, Empty.Cards, new DealerDetails("", "dealerid"),
                new Pegging(Empty.PeggedCards, inPlayCards, "", Empty.CannotGoes, Empty.GoHistory),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null);
            var mockScoreIncrementer = new Mock<IScoreIncrementer>();

            var mockScoreFinder = new Mock<IScoreFinder>();
            var teamOrPlayerScore = new Score(1, 2, 3);
            mockScoreFinder.Setup(scoreFinder => scoreFinder.Find(match, "pegger")).Returns(teamOrPlayerScore);


            var mockCribScorer = new Mock<ICribScorer>();
            var peggingScoring = new PegScoring(pegged31, false, 0, 0, false);
            mockCribScorer.Setup(cribScorer => cribScorer.GetPegging(It.IsAny<List<PlayingCard>>(), It.IsAny<bool>())).Returns(peggingScoring);

            var cribMatchScorer = new CribMatchScorer(mockScoreFinder.Object, mockScoreIncrementer.Object, mockCribScorer.Object, new Mock<IHandReconstructor>().Object);

            var (peggingResult, peggingScore) = cribMatchScorer.ScorePegging(match, new List<PlayingCard> {}, true, "pegger");

            mockScoreIncrementer.Verify(scoreIncrementer => scoreIncrementer.Increment(teamOrPlayerScore, pegged31 ? 2 : 0));
            Assert.That(peggingResult, Is.EqualTo(pegged31 ? PeggingResult.ThirtyOne : PeggingResult.Continue));
        }

        [TestCase(PeggingResult.GameWon)]
        [TestCase(PeggingResult.Continue)]
        [TestCase(PeggingResult.ThirtyOne)]
        public void ScorePegging_Should_Return_Correct_PeggingResult(PeggingResult pegResult)
        {
            var match = new CribMatch(
                Empty.MatchPlayer(""), Empty.MatchPlayer(""), null, null, CribGameState.Discard, Cards.JackHearts, Empty.Cards, new DealerDetails("", "dealerid"),
                new Pegging(Empty.PeggedCards, new List<PeggedCard> { new PeggedCard("owner", Cards.AceClubs, Empty.PegScoring) }, "", Empty.CannotGoes, Empty.GoHistory),
                Empty.Scores, "3", "id", Empty.ChangeHistory, "", null);


            var mockScoreFinder = new Mock<IScoreFinder>();
            var teamOrPlayerScore = new Score(0, 0, 0);
            mockScoreFinder.Setup(scoreFinder => scoreFinder.Find(match, "pegger")).Returns(teamOrPlayerScore);

            var mockCribScorer = new Mock<ICribScorer>();
            PegScoring pegScoring = new PegScoring(false, true, 0, 0, false);
            switch (pegResult)
            {
                case PeggingResult.ThirtyOne:
                    pegScoring = new PegScoring(true, false, 0, 0, false);
                    break;
                case PeggingResult.GameWon:
                    pegScoring = new PegScoring(false, false, 3, 0, false);
                    break;

            }
            
            mockCribScorer.Setup(cribScorer => cribScorer.GetPegging(It.IsAny<List<PlayingCard>>(), It.IsAny<bool>())).Returns(pegScoring);
            var mockScoreIncrementer = new Mock<IScoreIncrementer>();
            mockScoreIncrementer.Setup(scoreIncrementer => scoreIncrementer.Increment(teamOrPlayerScore, pegScoring.Score)).Callback(() =>
            {
                if(pegResult == PeggingResult.GameWon)
                {
                    teamOrPlayerScore.Games = 1;
                }
            });
            var cribMatchScorer = new CribMatchScorer(mockScoreFinder.Object,mockScoreIncrementer.Object, mockCribScorer.Object, new Mock<IHandReconstructor>().Object);

            var (peggingResult, _) = cribMatchScorer.ScorePegging(match, new List<PlayingCard>(),true, "pegger");

            Assert.That(peggingResult, Is.EqualTo(pegResult));
        }


        [TestCase(true)]
        [TestCase(false)]
        public void ScorePegging_Should_Score_When_Pegging_Completed(bool peggingCompleted)
        {
            var match = new CribMatch(
                Empty.MatchPlayer(""),
                new MatchPlayer("", peggingCompleted ? Empty.Cards : new List<PlayingCard> { Cards.AceClubs }, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Discard,
                Cards.JackHearts,
                Empty.Cards,
                new DealerDetails("", "dealerid"),
                new Pegging(Empty.PeggedCards, new List<PeggedCard> { new PeggedCard("owner", Cards.AceHearts, Empty.PegScoring) }, "", Empty.CannotGoes, Empty.GoHistory),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null);


            var mockCribScorer = new Mock<ICribScorer>();
            var pegScoringFromCribScorer = new PegScoring(false, false, 0, 0, peggingCompleted);
            mockCribScorer.Setup(cribScorer => cribScorer.GetPegging(new List<PlayingCard> { Cards.AceHearts, Cards.AceDiamonds }, peggingCompleted)).Returns(pegScoringFromCribScorer);

            var mockScoreFinder = new Mock<IScoreFinder>();
            var teamOrPlayerScore = new Score(1, 2, 3);
            mockScoreFinder.Setup(scoreFinder => scoreFinder.Find(match, "pegger")).Returns(teamOrPlayerScore);

            var cribMatchScorer = new CribMatchScorer(
                mockScoreFinder.Object,
                new Mock<IScoreIncrementer>().Object,
                mockCribScorer.Object,
                new Mock<IHandReconstructor>().Object);

            var (_, pegScoring) = cribMatchScorer.ScorePegging(match, new List<PlayingCard> { Cards.AceHearts, Cards.AceDiamonds },peggingCompleted, "pegger");

            Assert.That(pegScoring, Is.SameAs(pegScoringFromCribScorer));
        }

        [Test]
        public void ScoreGo_Should_Increment_Player_Or_Team_Score_By_1()
        {
            var match = new CribMatch(
                Empty.MatchPlayer(""),
                Empty.MatchPlayer(""),
                null,
                null,
                CribGameState.Discard,
                Cards.JackHearts,
                Empty.Cards,
                new DealerDetails("", "dealerid"),
                Empty.Pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null);
            var mockScoreIncrementer = new Mock<IScoreIncrementer>();

            var mockScoreFinder = new Mock<IScoreFinder>();
            var teamOrPlayerScore = new Score(1, 2, 3);
            mockScoreFinder.Setup(scoreFinder => scoreFinder.Find(match, "player")).Returns(teamOrPlayerScore);

            var cribMatchScorer = new CribMatchScorer(mockScoreFinder.Object, mockScoreIncrementer.Object, new Mock<ICribScorer>().Object, new Mock<IHandReconstructor>().Object);

            cribMatchScorer.ScoreGo(match, "player");

            mockScoreIncrementer.Verify(scoreIncrementer => scoreIncrementer.Increment(teamOrPlayerScore, 1));
        }

        [TestCase(true)]
        [TestCase(false)]
        public void ScoreGo_Should_Return_True_If_Game_Won(bool gameWon)
        {
            var match = new CribMatch(
                Empty.MatchPlayer(""), Empty.MatchPlayer(""), null, null, CribGameState.Discard, Cards.JackHearts, Empty.Cards, new DealerDetails("", "dealerid"),
                Empty.Pegging,
                Empty.Scores, "3", "id", Empty.ChangeHistory, "", null);

            var mockScoreFinder = new Mock<IScoreFinder>();
            var teamOrPlayerScore = new Score(0, 0, 0);
            mockScoreFinder.Setup(scoreFinder => scoreFinder.Find(match, "player")).Returns(teamOrPlayerScore);
            var mockScoreIncrementer = new Mock<IScoreIncrementer>();
            mockScoreIncrementer.Setup(scoreIncrementer => scoreIncrementer.Increment(teamOrPlayerScore, 1)).Callback(() =>
            {
                if (gameWon)
                {
                    teamOrPlayerScore.Games = 1;
                }
            });
            var cribMatchScorer = new CribMatchScorer(mockScoreFinder.Object, mockScoreIncrementer.Object, new Mock<ICribScorer>().Object, new Mock<IHandReconstructor>().Object);

            Assert.That(cribMatchScorer.ScoreGo(match, "player"), Is.EqualTo(gameWon));
        }

        [Test]
        public void ScoreShow_Should_Reconstruct_Hands_From_Pegging()
        {
            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                Empty.MatchPlayer("p3"),
                Empty.MatchPlayer("p4"),
                CribGameState.Show,
                Cards.JackHearts,
                Empty.Cards,
                new DealerDetails("", "p1"),
                Empty.Pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null);

            var mockScoreIncrementer = new Mock<IScoreIncrementer>();

            var mockScoreFinder = new Mock<IScoreFinder>();
            var teamOrPlayerScore = new Score(1, 2, 3);
            mockScoreFinder.Setup(scoreFinder => scoreFinder.Find(match, It.IsAny<string>())).Returns(teamOrPlayerScore);

            var mockHandReconstructor = new Mock<IHandReconstructor>();
            mockHandReconstructor.Setup(mockHandReconstructor => mockHandReconstructor.Reconstruct(match.Pegging, "p1", new List<string> { "p1", "p2", "p3", "p4" }))
                .Returns(new List<(string, IEnumerable<PlayingCard>)> { ("p1", new List<PlayingCard>()) });

            var mockCribScorer = new Mock<ICribScorer>();
            mockCribScorer.Setup(cribScorer => cribScorer.GetShow(It.IsAny<List<PlayingCard>>(), It.IsAny<PlayingCard>(), It.IsAny<bool>()))
                .Returns(new ShowScore());
            var cribMatchScorer = new CribMatchScorer(mockScoreFinder.Object, mockScoreIncrementer.Object, mockCribScorer.Object, mockHandReconstructor.Object);

            cribMatchScorer.ScoreShow(match);

            mockHandReconstructor.VerifyAll();


        }

        [Test]
        public void ScoreShow_Should_Increment_Team_Or_Player_Score_For_All_Hands_And_Box_If_Game_Is_Not_Won_In_Correct_Order()
        {
            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Show,
                Cards.JackHearts,
                new List<PlayingCard> { Cards.AceClubs, Cards.TwoClubs, Cards.ThreeClubs, Cards.FourClubs },
                new DealerDetails("", "p1"),
                Empty.Pegging,
                Empty.Scores, "3", "id", Empty.ChangeHistory, "", null);


            var mockScoreFinder = new Mock<IScoreFinder>();
            var p1Score = new Score(1, 2, 3);
            var p2Score = new Score(2, 3, 4);
            var dealerBoxScore = new Score(3, 4, 5);
            mockScoreFinder.SetupSequence(scoreFinder => scoreFinder.Find(match, "p1")).Returns(p1Score).Returns(dealerBoxScore);
            mockScoreFinder.Setup(scoreFinder => scoreFinder.Find(match, "p2")).Returns(p2Score);

            var mockHandReconstructor = new Mock<IHandReconstructor>();
            var p1Hand = new List<PlayingCard> { Cards.AceClubs };
            var dealerHand = new List<PlayingCard> { Cards.AceHearts };
            mockHandReconstructor.Setup(mockHandReconstructor => mockHandReconstructor.Reconstruct(match.Pegging, "p1", new List<string> { "p1", "p2" }))
                .Returns(new List<(string, IEnumerable<PlayingCard>)> { ("p1", p1Hand), ("p2", dealerHand) });

            var mockCribScorer = new Mock<ICribScorer>();
            mockCribScorer.Setup(cribScorer => cribScorer.GetShow(p1Hand, Cards.JackHearts, false)).Returns(new ShowScore() { OneForHisKnob = Cards.JackClubs });
            mockCribScorer.Setup(cribScorer => cribScorer.GetShow(dealerHand, Cards.JackHearts, false)).Returns(new ShowScore() { Pairs = new List<Pair> { new Pair(Cards.TwoClubs, Cards.TwoDiamonds) } });
            mockCribScorer.Setup(cribScorer => cribScorer.GetShow(match.Box, Cards.JackHearts, true)).Returns(new ShowScore() { Runs = new List<List<PlayingCard>> { new List<PlayingCard> { Cards.AceClubs, Cards.TwoDiamonds, Cards.ThreeClubs } } });


            var mockScoreIncrementer = new Mock<IScoreIncrementer>();
            var showScores = new List<int>();
            mockScoreIncrementer.Setup(scoreIncrementer => scoreIncrementer.Increment(p1Score, 1)).Callback<Score, int>((_, showScore) =>
            {
                showScores.Add(showScore);
            });
            mockScoreIncrementer.Setup(scoreIncrementer => scoreIncrementer.Increment(p2Score, 2)).Callback<Score, int>((_, showScore) =>
            {
                showScores.Add(showScore);
            });
            mockScoreIncrementer.Setup(scoreIncrementer => scoreIncrementer.Increment(dealerBoxScore, 3)).Callback<Score, int>((_, showScore) =>
            {
                showScores.Add(showScore);
            });

            var cribMatchScorer = new CribMatchScorer(mockScoreFinder.Object, mockScoreIncrementer.Object, mockCribScorer.Object, mockHandReconstructor.Object);

            cribMatchScorer.ScoreShow(match);

            mockScoreFinder.VerifyAll();
            Assert.That(showScores, Is.EqualTo(new List<int> { 1, 2, 3 }));
        }


        public class ScoreShowHighestScoreCase
        {
            public ScoreShowHighestScoreCase(
                bool dealerPlayer1,
                ShowScore boxScore,
                PlayerScoringHistory p1ScoringHistory,
                ShowScore p1HandScore,
                PlayerScoringHistory p2ScoringHistory,
                ShowScore p2HandScore,
                Action<List<PlayingCard>, List<PlayingCard>, List<PlayingCard>, PlayingCard> assertion)
            {
                P1ScoringHistory = p1ScoringHistory;
                P1HandScore = p1HandScore;
                DealerPlayer1 = dealerPlayer1;
                BoxScore = boxScore;
                P2ScoringHistory = p2ScoringHistory;
                P2HandScore = p2HandScore;
                Assertion = assertion;
            }

            public PlayerScoringHistory P1ScoringHistory { get; }
            public ShowScore P1HandScore { get; }
            public bool DealerPlayer1 { get; }
            public ShowScore BoxScore { get; }
            public PlayerScoringHistory P2ScoringHistory { get; }
            public ShowScore P2HandScore { get; }
            public Action<List<PlayingCard>, List<PlayingCard>, List<PlayingCard>, PlayingCard> Assertion { get; }
        }
        public class ScoreShowHighestScoreCases : IEnumerable
        {
            public IEnumerator GetEnumerator()
            {
                static PlayerScoringHistory NoScoringHistory()
                {
                    return new PlayerScoringHistory(
                            new ScoringHistory<HighestScoringCards>(0, 0, null),
                            new ScoringHistory<HighestScoringCards>(0, 0, null),
                            new ScoringHistory<HandAndBoxHighestScoringCards>(0, 0, null)
                        );
                }
                var p1DealerNoScoringHistory = NoScoringHistory();

                var p2NoScoringHistory = NoScoringHistory();

                var scores4 = new ShowScore() { Flush = { Cards.AceClubs, Cards.NineClubs, Cards.JackClubs, Cards.KingClubs } };
                var scores5 = new ShowScore()
                {
                    OneForHisKnob = Cards.JackDiamonds,
                    Flush = { Cards.AceClubs, Cards.NineClubs, Cards.QueenClubs, Cards.KingClubs }
                };
                var scores2 = new ShowScore() { Pairs = new List<Pair> { new Pair(Cards.TwoDiamonds, Cards.TwoClubs) } };
                yield return new TestCaseData(
                    new ScoreShowHighestScoreCase(
                        true,
                        scores4,
                        p1DealerNoScoringHistory,
                        scores2,
                        p2NoScoringHistory,
                        scores5,
                        (p1Hand, p2Hand, p1Box, cutCard) =>
                        {
                            Assert.Multiple(() =>
                            {
                                var p1handHistory = p1DealerNoScoringHistory.HandHistory;
                                Assert.That(p1handHistory.NumScores, Is.EqualTo(1));
                                Assert.That(p1handHistory.TotalScore, Is.EqualTo(2));
                                Assert.That(p1handHistory.HighestScoringCards!.CutCard, Is.EqualTo(cutCard));
                                Assert.That(p1handHistory.HighestScoringCards!.HandOrBox, Is.EqualTo(p1Hand));
                                Assert.That(p1handHistory.HighestScoringCards!.Score, Is.EqualTo(2));

                                var p1boxHistory = p1DealerNoScoringHistory.BoxHistory;
                                Assert.That(p1boxHistory.NumScores, Is.EqualTo(1));
                                Assert.That(p1boxHistory.TotalScore, Is.EqualTo(4));
                                Assert.That(p1boxHistory.HighestScoringCards!.CutCard, Is.EqualTo(cutCard));
                                Assert.That(p1boxHistory.HighestScoringCards!.HandOrBox, Is.EqualTo(p1Box));
                                Assert.That(p1boxHistory.HighestScoringCards!.Score, Is.EqualTo(4));

                                var p1HandAndBoxHistory = p1DealerNoScoringHistory.HandAndBoxHistory;
                                Assert.That(p1HandAndBoxHistory.NumScores, Is.EqualTo(1));
                                Assert.That(p1HandAndBoxHistory.TotalScore, Is.EqualTo(6));
                                Assert.That(p1HandAndBoxHistory.HighestScoringCards!.CutCard, Is.EqualTo(cutCard));
                                Assert.That(p1HandAndBoxHistory.HighestScoringCards!.HandScore, Is.EqualTo(2));
                                Assert.That(p1HandAndBoxHistory.HighestScoringCards!.BoxScore, Is.EqualTo(4));
                                Assert.That(p1HandAndBoxHistory.HighestScoringCards!.Score, Is.EqualTo(6));
                                Assert.That(p1HandAndBoxHistory.HighestScoringCards!.Hand, Is.EqualTo(p1Hand));
                                Assert.That(p1HandAndBoxHistory.HighestScoringCards!.Box, Is.EqualTo(p1Box));

                                Assert.That(p2NoScoringHistory.BoxHistory.HighestScoringCards, Is.Null);
                                Assert.That(p2NoScoringHistory.HandAndBoxHistory.HighestScoringCards, Is.Null);
                                var p2handHistory = p2NoScoringHistory.HandHistory;
                                Assert.That(p2handHistory.NumScores, Is.EqualTo(1));
                                Assert.That(p2handHistory.TotalScore, Is.EqualTo(5));
                                Assert.That(p2handHistory.HighestScoringCards!.CutCard, Is.EqualTo(cutCard));
                                Assert.That(p2handHistory.HighestScoringCards!.HandOrBox, Is.EqualTo(p2Hand));
                                Assert.That(p2handHistory.HighestScoringCards!.Score, Is.EqualTo(5));
                            });
                        })


                ).SetName("HighestScoringCards no previous score");

                var doesNotBeatHand = new List<PlayingCard> { Cards.SevenClubs };
                var doesNotBeatHighestScoringCards = new HighestScoringCards(29, doesNotBeatHand, Cards.EightClubs);
                var beatsHighestScoringCards = new HighestScoringCards(1, new List<PlayingCard>(), Cards.EightClubs);

                var p1DealerWithHistory = new PlayerScoringHistory(
                            new ScoringHistory<HighestScoringCards>(1, 29, doesNotBeatHighestScoringCards),
                            new ScoringHistory<HighestScoringCards>(1, 1, beatsHighestScoringCards),
                            new ScoringHistory<HandAndBoxHighestScoringCards>(1, 1, new HandAndBoxHighestScoringCards(1, 0, new List<PlayingCard>(), new List<PlayingCard>(), Cards.EightClubs))
                        );

                var p2NoScoringHistory2 = NoScoringHistory();


                yield return new TestCaseData(
                    new ScoreShowHighestScoreCase(
                        true,
                        scores4,
                        p1DealerWithHistory,
                        scores2,
                        p2NoScoringHistory,
                        scores5,
                        (p1Hand, p2Hand, p1Box, cutCard) =>
                        {
                            Assert.Multiple(() =>
                            {
                                var p1handHistory = p1DealerWithHistory.HandHistory;
                                Assert.That(p1handHistory.NumScores, Is.EqualTo(2));
                                Assert.That(p1handHistory.TotalScore, Is.EqualTo(31));
                                Assert.That(p1handHistory.HighestScoringCards!.CutCard, Is.EqualTo(Cards.EightClubs));
                                Assert.That(p1handHistory.HighestScoringCards!.HandOrBox, Is.EqualTo(doesNotBeatHand));
                                Assert.That(p1handHistory.HighestScoringCards!.Score, Is.EqualTo(29));

                                var p1boxHistory = p1DealerWithHistory.BoxHistory;
                                Assert.That(p1boxHistory.NumScores, Is.EqualTo(2));
                                Assert.That(p1boxHistory.TotalScore, Is.EqualTo(5));
                                Assert.That(p1boxHistory.HighestScoringCards!.CutCard, Is.EqualTo(cutCard));
                                Assert.That(p1boxHistory.HighestScoringCards!.HandOrBox, Is.EqualTo(p1Box));
                                Assert.That(p1boxHistory.HighestScoringCards!.Score, Is.EqualTo(4));


                            });
                        })


                ).SetName("HighestScoringCards previous score - hand beaten, box not");

            }
        }

        [TestCaseSource(typeof(ScoreShowHighestScoreCases))]
        public void ScoreShow_Should_Update_HighestScoringCards_If_First_Score_Or_Is_Highest_Score(ScoreShowHighestScoreCase scoreCase)
        {
            var cutCard = Cards.JackHearts;
            var box = new List<PlayingCard> { Cards.AceClubs, Cards.TwoClubs, Cards.ThreeClubs, Cards.FourClubs };
            var match = new CribMatch(
                new MatchPlayer("p1", Empty.Cards, false, scoreCase.P1ScoringHistory),
                new MatchPlayer("p2", Empty.Cards, false, scoreCase.P2ScoringHistory),
                null,
                null,
                CribGameState.Show,
                cutCard,
                box,
                new DealerDetails("", scoreCase.DealerPlayer1 ? "p1" : "p2"),
                Empty.Pegging,
                Empty.Scores, "3", "id", Empty.ChangeHistory, "", null);


            var mockScoreFinder = new Mock<IScoreFinder>();
            mockScoreFinder.Setup(scoreFinder => scoreFinder.Find(It.IsAny<CribMatch>(), It.IsAny<string>())).Returns(new Score(0, 2, 0));

            var mockHandReconstructor = new Mock<IHandReconstructor>();
            var p1Hand = new List<PlayingCard> { Cards.AceSpades };
            var p2Hand = new List<PlayingCard> { Cards.AceHearts };
            mockHandReconstructor.Setup(handReconstructor => handReconstructor.Reconstruct(It.IsAny<Pegging>(), It.IsAny<string>(), It.IsAny<List<string>>()))
                .Returns(new List<(string, IEnumerable<PlayingCard>)> { ("p1", p1Hand), ("p2", p2Hand) });

            var mockCribScorer = new Mock<ICribScorer>();
            mockCribScorer.Setup(cribScorer => cribScorer.GetShow(p1Hand, cutCard, false)).Returns(scoreCase.P1HandScore);
            mockCribScorer.Setup(cribScorer => cribScorer.GetShow(p2Hand, cutCard, false)).Returns(scoreCase.P2HandScore);
            mockCribScorer.Setup(cribScorer => cribScorer.GetShow(box, cutCard, true)).Returns(scoreCase.BoxScore);

            var cribMatchScorer = new CribMatchScorer(mockScoreFinder.Object, new Mock<IScoreIncrementer>().Object, mockCribScorer.Object, mockHandReconstructor.Object);

            cribMatchScorer.ScoreShow(match);

            scoreCase.Assertion(p1Hand, p2Hand, box, cutCard);
        }

        public enum ScoreShowWinner { P1, P2, Box, None }

        [TestCase(ScoreShowWinner.P1)]
        [TestCase(ScoreShowWinner.P2)]
        [TestCase(ScoreShowWinner.Box)]
        [TestCase(ScoreShowWinner.None)]
        public void ScoreShow_Should_Return_If_Game_Won(ScoreShowWinner scoreShowWinner)
        {
            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Show,
                Cards.JackHearts,
                new List<PlayingCard> { Cards.AceClubs, Cards.TwoClubs, Cards.ThreeClubs, Cards.FourClubs },
                new DealerDetails("", "p1"),
                Empty.Pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null);


            var mockScoreFinder = new Mock<IScoreFinder>(MockBehavior.Strict);
            var p1Score = new Score(0, 0, 0);
            var p1BoxScore = new Score(0, 0, 0);
            var p2Score = new Score(0, 0, 0);

            mockScoreFinder.SetupSequence(scoreFinder => scoreFinder.Find(match, "p1"))
                .Returns(p1Score)
                .Returns(p1BoxScore);
            mockScoreFinder.Setup(scoreFinder => scoreFinder.Find(match, "p2")).Returns(p2Score);

            var mockHandReconstructor = new Mock<IHandReconstructor>();
            var p1Hand = new List<PlayingCard> { Cards.AceClubs };
            var dealerHand = new List<PlayingCard> { Cards.AceHearts };
            mockHandReconstructor.Setup(mockHandReconstructor => mockHandReconstructor.Reconstruct(match.Pegging, "p1", new List<string> { "p1", "p2" }))
                .Returns(new List<(string, IEnumerable<PlayingCard>)> { ("p1", p1Hand), ("p2", dealerHand) });


            var mockCribScorer = new Mock<ICribScorer>();
            mockCribScorer.Setup(cribScorer => cribScorer.GetShow(It.IsAny<List<PlayingCard>>(), It.IsAny<PlayingCard>(), It.IsAny<bool>())).Returns(new ShowScore());
            var mockScoreIncrementer = new Mock<IScoreIncrementer>();
            mockScoreIncrementer.Setup(scoreIncrementer => scoreIncrementer.Increment(p1Score, 0)).Callback(() =>
            {
                if(scoreShowWinner == ScoreShowWinner.P1)
                {
                    p1Score.Games = 1;
                }
            });
            mockScoreIncrementer.Setup(scoreIncrementer => scoreIncrementer.Increment(p1BoxScore, 0)).Callback(() =>
            {
                if (scoreShowWinner == ScoreShowWinner.Box)
                {
                    p1BoxScore.Games = 1;
                }
            });
            mockScoreIncrementer.Setup(scoreIncrementer => scoreIncrementer.Increment(p2Score, 0)).Callback(() =>
            {
                if (scoreShowWinner == ScoreShowWinner.P2)
                {
                    p2Score.Games = 1;
                }
            });
            var cribMatchScorer = new CribMatchScorer(mockScoreFinder.Object, mockScoreIncrementer.Object, mockCribScorer.Object, mockHandReconstructor.Object);

            var gameWon = cribMatchScorer.ScoreShow(match);
            Assert.That(gameWon, Is.EqualTo(scoreShowWinner != ScoreShowWinner.None));

        }

        [Test]
        public void ScoreShow_Should_Not_Score_Once_Game_Is_Won()
        {
            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Show,
                Cards.JackHearts,
                new List<PlayingCard> { Cards.AceClubs, Cards.TwoClubs, Cards.ThreeClubs, Cards.FourClubs },
                new DealerDetails("", "p1"),
                Empty.Pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null);


            var mockScoreFinder = new Mock<IScoreFinder>(MockBehavior.Strict);
            var p1Score = new Score(1, 2, 3);
            mockScoreFinder.Setup(scoreFinder => scoreFinder.Find(match, "p1")).Returns(p1Score);

            var mockHandReconstructor = new Mock<IHandReconstructor>();
            var p1Hand = new List<PlayingCard> { Cards.AceClubs };
            var dealerHand = new List<PlayingCard> { Cards.AceHearts };
            mockHandReconstructor.Setup(mockHandReconstructor => mockHandReconstructor.Reconstruct(match.Pegging, "p1", new List<string> { "p1", "p2" }))
                .Returns(new List<(string, IEnumerable<PlayingCard>)> { ("p1", p1Hand), ("p2", dealerHand) });

            var mockCribScorer = new Mock<ICribScorer>(MockBehavior.Strict); // Strict
            var p1ShowScore = new ShowScore() { OneForHisKnob = Cards.JackDiamonds };
            mockCribScorer.Setup(cribScorer => cribScorer.GetShow(p1Hand, Cards.JackHearts, false)).Returns(p1ShowScore);


            var mockScoreIncrementer = new Mock<IScoreIncrementer>(MockBehavior.Strict); // Strict
            mockScoreIncrementer.Setup(scoreIncrementer => scoreIncrementer.Increment(p1Score, 1)).Callback<Score, int>((score, _) =>
            {
                score.Games = 2;
            });
            var cribMatchScorer = new CribMatchScorer(mockScoreFinder.Object, mockScoreIncrementer.Object, mockCribScorer.Object, mockHandReconstructor.Object);

            cribMatchScorer.ScoreShow(match);

            var showScoring = match.ShowScoring;
            Assert.That(showScoring, Is.Not.Null);
            Assert.That(showScoring.BoxScore, Is.Null);
            Assert.That(showScoring.PlayerShowScores.Count, Is.EqualTo(1));
            var p1ShowScores = showScoring.PlayerShowScores[0];
            Assert.That(p1ShowScores.PlayerId, Is.EqualTo("p1"));
            Assert.That(p1ShowScores.ShowScore, Is.SameAs(p1ShowScore));

        }

        [Test]
        public void ScoreShow_Should_Add_ShowScoring_To_The_CribMatch()
        {
            var match = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer("p2"),
                null,
                null,
                CribGameState.Show,
                Cards.JackHearts,
                new List<PlayingCard> { Cards.AceClubs, Cards.TwoClubs, Cards.ThreeClubs, Cards.FourClubs },
                new DealerDetails("", "p1"),
                Empty.Pegging,
                Empty.Scores, "3", "id", Empty.ChangeHistory, "", null);


            var mockScoreFinder = new Mock<IScoreFinder>();
            mockScoreFinder.Setup(scoreFinder => scoreFinder.Find(match, It.IsAny<string>())).Returns(new Score(1, 2, 3));

            var mockHandReconstructor = new Mock<IHandReconstructor>();
            var p1Hand = new List<PlayingCard> { Cards.AceClubs };
            var dealerHand = new List<PlayingCard> { Cards.AceHearts };
            mockHandReconstructor.Setup(mockHandReconstructor => mockHandReconstructor.Reconstruct(match.Pegging, "p1", new List<string> { "p1", "p2" }))
                .Returns(new List<(string, IEnumerable<PlayingCard>)> { ("p1", p1Hand), ("p2", dealerHand) });

            var mockCribScorer = new Mock<ICribScorer>();
            var p1ShowScore = new ShowScore() { OneForHisKnob = Cards.JackClubs };
            var dealerHandShowScore = new ShowScore() { Pairs = new List<Pair> { new Pair(Cards.TwoClubs, Cards.TwoDiamonds) } };
            var boxShowScore = new ShowScore() { Runs = new List<List<PlayingCard>> { new List<PlayingCard> { Cards.AceClubs, Cards.TwoDiamonds, Cards.ThreeClubs } } };

            mockCribScorer.Setup(cribScorer => cribScorer.GetShow(p1Hand, Cards.JackHearts, false)).Returns(p1ShowScore);
            mockCribScorer.Setup(cribScorer => cribScorer.GetShow(dealerHand, Cards.JackHearts, false)).Returns(dealerHandShowScore);
            mockCribScorer.Setup(cribScorer => cribScorer.GetShow(match.Box, Cards.JackHearts, true)).Returns(boxShowScore);

            var cribMatchScorer = new CribMatchScorer(mockScoreFinder.Object, new Mock<IScoreIncrementer>().Object, mockCribScorer.Object, mockHandReconstructor.Object);

            cribMatchScorer.ScoreShow(match);


            Assert.Multiple(() =>
            {
                var showScoring = match.ShowScoring;

                Assert.That(showScoring!.BoxScore, Is.SameAs(boxShowScore));
                Assert.That(showScoring.PlayerShowScores, Is.EqualTo(new List<PlayerShowScore>
                {
                    new PlayerShowScore(p1ShowScore, "p1"),
                    new PlayerShowScore(dealerHandShowScore, "p2")
                }));
            });

        }
    }
}
