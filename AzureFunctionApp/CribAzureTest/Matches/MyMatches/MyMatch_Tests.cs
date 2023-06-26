using CribAzureFunctionApp.Utilities;
using CribAzureFunctionApp.Matches.Change;
using CribAzureFunctionApp.Matches.Utilities;
using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.State;
using CribAzureFunctionApp.Matches.Scoring;
using CribAzureFunctionApp.Matches.Scoring.Match;
using CribAzureFunctionApp.Matches.Scoring.Scorer;
using CribAzureFunctionApp.Matches.Scoring.Match.Utilities;
using CribAzureFunctionApp.Matches.MyMatches;
using CribAzureTest.TestHelpers;
using CribAzureFunctionApp.Matches.Deal;

namespace CribAzureTest.Matches.MyMatches
{
    internal class MyMatch_Tests
    {
        [Test]
        public void Should_Be_Able_Determine_Client_Side_Unseen_Discards()
        {
            var scoreFinder = new ScoreFinder();
            var matchLogic = new MatchLogic(
                new MatchVerifier(),
                new CribMatchScorer(
                   scoreFinder,
                    new ScoreIncrementer(),
                    new CribScorer(),
                    new HandReconstructor(new NextPlayer())
                ),
                new NextPlayer(),
                new CribDealer(new CribPlayingCardsProvider<PlayingCard>(new Shuffler<PlayingCard>()), new Deck()),
                new Date());

            var myMatchFactory = new MyMatchFactory(scoreFinder);

            static CribMatch CreateMatch()
            {
                return new CribMatch(
                new MatchPlayer("Me", new List<PlayingCard> {
                    Cards.AceDiamonds, Cards.TwoDiamonds, Cards.ThreeDiamonds, Cards.FourDiamonds, Cards.FiveDiamonds, Cards.SixDiamonds
                }, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("Other1", new List<PlayingCard> {
                    Cards.EightSpades, Cards.FiveSpades, Cards.FourSpades, Cards.SevenSpades, Cards.TwoSpades, Cards.ThreeSpades
                }, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Discard,
                Cards.AceSpades,
                Empty.Cards,
                new DealerDetails("Me", "Me"),
                new Pegging(Empty.PeggedCards, Empty.PeggedCards, "Other1", Pegging.AllCanGo(2), Empty.GoHistory),
                new List<Score> { Empty.Score, Empty.Score },
                "3",
                "id", Empty.ChangeHistory, "", null
                );
            }

            var myMatch = myMatchFactory.ToMyMatch(CreateMatch(), "Me");

            var match = CreateMatch();
            matchLogic.Discard(match, "Other1", Cards.EightSpades, Cards.SevenSpades);
            var myMatchAfterDiscard = myMatchFactory.ToMyMatch(match, "Me");

            // you would determine those that have changed 
            var hasDiscarded = myMatchAfterDiscard.OtherPlayers.Count(p => p.Discarded) != myMatch.OtherPlayers.Count(p => p.Discarded);
            Assert.That(hasDiscarded, Is.True);
        }

        [Test]
        public void Should_Be_Able_To_Reconstruct_Go_Only_Changes_On_The_Client()
        {
            //go with no previous goes
            var pegging = new Pegging(new List<PeggedCard> { new PeggedCard("", Cards.NineClubs, Empty.PegScoring) }, Empty.PeggedCards, "", Empty.CannotGoes, Empty.GoHistory);
            var newPegging = new Pegging(new List<PeggedCard> { new PeggedCard("", Cards.NineClubs, Empty.PegScoring) }, Empty.PeggedCards, "", Empty.CannotGoes, new List<Go> { new Go("p1", 0) });

            var peggingChanges = PeggingReconstructor.Reconstruct(pegging, newPegging);
            Assert.That(peggingChanges, Is.EqualTo(new List<PeggingChange> { PeggingChange.GoChange("p1") }));

            // does not include previous go 
            pegging = new Pegging(new List<PeggedCard> { new PeggedCard("", Cards.NineClubs, Empty.PegScoring) }, Empty.PeggedCards, "", Empty.CannotGoes, new List<Go> { new Go("p2", 0) });
            newPegging = new Pegging(new List<PeggedCard> { new PeggedCard("", Cards.NineClubs, Empty.PegScoring) }, Empty.PeggedCards, "", Empty.CannotGoes, new List<Go> { new Go("p2", 0), new Go("p1", 0) });

            peggingChanges = PeggingReconstructor.Reconstruct(pegging, newPegging);
            Assert.That(peggingChanges, Is.EqualTo(new List<PeggingChange> { PeggingChange.GoChange("p1") }));

            //multiple new goes
            pegging = new Pegging(new List<PeggedCard> { new PeggedCard("", Cards.NineClubs, Empty.PegScoring) }, Empty.PeggedCards, "", Empty.CannotGoes, new List<Go> { new Go("p2", 0) });
            newPegging = new Pegging(new List<PeggedCard> { new PeggedCard("", Cards.NineClubs, Empty.PegScoring) }, Empty.PeggedCards, "", Empty.CannotGoes, new List<Go> { new Go("p2", 0), new Go("p1", 0), new Go("pother", 0) });

            peggingChanges = PeggingReconstructor.Reconstruct(pegging, newPegging);
            Assert.That(peggingChanges, Is.EqualTo(new List<PeggingChange> { PeggingChange.GoChange("p1"), PeggingChange.GoChange("pother") }));

            // more complicated
            pegging = new Pegging(Empty.PeggedCards, new List<PeggedCard> { new PeggedCard("", Cards.NineClubs, Empty.PegScoring), new PeggedCard("", Cards.EightClubs, Empty.PegScoring) }, "", Empty.CannotGoes, new List<Go> { new Go("p1", 0), new Go("p2", 1) });
            newPegging = new Pegging(Empty.PeggedCards, new List<PeggedCard> { new PeggedCard("", Cards.NineClubs, Empty.PegScoring), new PeggedCard("", Cards.EightClubs, Empty.PegScoring) }, "", Empty.CannotGoes, new List<Go> { new Go("p1", 0), new Go("p2", 1), new Go("pother", 1) });
            peggingChanges = PeggingReconstructor.Reconstruct(pegging, newPegging);
            Assert.That(peggingChanges, Is.EqualTo(new List<PeggingChange> { PeggingChange.GoChange("pother") }));

        }

        [Test]
        public void Should_Be_Able_To_Reconstruct_Peg_Only_Changes_On_The_Client()
        {
            var pegging = new Pegging(new List<PeggedCard> { new PeggedCard("", Cards.NineClubs, Empty.PegScoring) }, Empty.PeggedCards, "", Empty.CannotGoes, new List<Go> { new Go("p1", 0) });
            var newPegging = new Pegging(new List<PeggedCard> { new PeggedCard("", Cards.NineClubs, Empty.PegScoring), new PeggedCard("newPegger", Cards.TenClubs, Empty.PegScoring) }, Empty.PeggedCards, "", Empty.CannotGoes, new List<Go> { new Go("p1", 0) });

            var peggingChanges = PeggingReconstructor.Reconstruct(pegging, newPegging);
            Assert.That(peggingChanges, Is.EqualTo(new List<PeggingChange> { PeggingChange.Pegging("newPegger", Cards.TenClubs) }));

            // multiple pegging
            pegging = new Pegging(new List<PeggedCard> { new PeggedCard("", Cards.NineClubs, Empty.PegScoring) }, Empty.PeggedCards, "", Empty.CannotGoes, new List<Go> { new Go("p1", 0) });
            newPegging = new Pegging(new List<PeggedCard> { new PeggedCard("", Cards.NineClubs, Empty.PegScoring), new PeggedCard("newPegger", Cards.TenClubs, Empty.PegScoring), new PeggedCard("newPegger2", Cards.JackClubs, Empty.PegScoring) }, Empty.PeggedCards, "", Empty.CannotGoes, new List<Go> { new Go("p1", 0) });

            peggingChanges = PeggingReconstructor.Reconstruct(pegging, newPegging);
            Assert.That(peggingChanges, Is.EqualTo(new List<PeggingChange> { PeggingChange.Pegging("newPegger", Cards.TenClubs), PeggingChange.Pegging("newPegger2", Cards.JackClubs) }));

        }


        [Test]
        public void Should_Be_Able_To_Reconstruct_Goes_And_Peg_Changes_On_The_Client()
        {
            //var pegging = new Pegging(new List<PeggedCard> { new PeggedCard("", Cards.NineClubs) }, Empty.PeggedCards, "", Empty.CannotGoes, new List<Go> { new Go("p1", 0) });
            //var newPegging = new Pegging(new List<PeggedCard> { new PeggedCard("", Cards.NineClubs), new PeggedCard("newPegger", Cards.TenClubs) }, Empty.PeggedCards, "", Empty.CannotGoes, new List<Go> { new Go("p1", 0), new Go("pnewGo", 1) });

            //var peggingChanges = PeggingReconstructor.Reconstruct(pegging, newPegging);
            //Assert.That(peggingChanges, Is.EqualTo(new List<PeggingChange> { PeggingChange.Pegging("newPegger", Cards.TenClubs), PeggingChange.GoChange("pnewGo") }));

            //// switch InPlayCards and TurnedOverCards
            //newPegging = new Pegging(Empty.PeggedCards, new List<PeggedCard> { new PeggedCard("", Cards.NineClubs), new PeggedCard("newPegger", Cards.TenClubs) }, "", Empty.CannotGoes, new List<Go> { new Go("p1", 0), new Go("pnewGo", 1) });

            //peggingChanges = PeggingReconstructor.Reconstruct(pegging, newPegging);
            //Assert.That(peggingChanges, Is.EqualTo(new List<PeggingChange> { PeggingChange.Pegging("newPegger", Cards.TenClubs), PeggingChange.GoChange("pnewGo") }));

            //newPegging = new Pegging(Empty.PeggedCards, new List<PeggedCard> { new PeggedCard("", Cards.NineClubs), new PeggedCard("newPegger", Cards.TenClubs), new PeggedCard("newPegger2", Cards.JackClubs) }, "", Empty.CannotGoes, new List<Go> { new Go("p1", 0), new Go("pnewGo", 1), new Go("pnewGo2", 2) });
            //peggingChanges = PeggingReconstructor.Reconstruct(pegging, newPegging);
            //Assert.That(peggingChanges, Is.EqualTo(new List<PeggingChange> { PeggingChange.Pegging("newPegger", Cards.TenClubs), PeggingChange.GoChange("pnewGo"), PeggingChange.Pegging("newPegger2", Cards.JackClubs), PeggingChange.GoChange("pnewGo2") }));


        }

    }

    internal record PeggingChange(string PlayerId, bool IsGo, PlayingCard? Card)
    {
        public PeggingChange(string playerId) : this(playerId, default, null)
        {
        }

        public static PeggingChange GoChange(string playerId)
        {
            return new PeggingChange(playerId) { IsGo = true };
        }
        public static PeggingChange Pegging(string playerId, PlayingCard card)
        {
            return new PeggingChange(playerId) { Card = card };
        }
    }


    internal static class PeggingReconstructor
    {
        public static List<PeggedCard> GetAllPeggedCards(this Pegging pegging)
        {
            return pegging.InPlayCards.Concat(pegging.TurnedOverCards).ToList();
        }

        private static IEnumerable<Go> GetNewGoes(Pegging oldPegging, Pegging newPegging, int afterPegged)
        {
            var goes = newPegging.GoHistory.Where(go => go.afterPegged == afterPegged).ToList();
            var oldGoesCount = oldPegging.GoHistory.Where(go => go.afterPegged == afterPegged).Count();
            return goes.TakeLast(goes.Count - oldGoesCount);
        }

        public static List<PeggingChange> Reconstruct(Pegging oldPegging, Pegging newPegging)
        {
            var peggingChanges = new List<PeggingChange>();

            var oldGoHistory = oldPegging.GoHistory;
            var numOldPeggedCards = oldPegging.GetAllPeggedCards().Count;
            var peggedCards = newPegging.GetAllPeggedCards();
            var goHistory = newPegging.GoHistory;

            for (var i = 0; i < peggedCards.Count; i++)
            {
                var peggedCard = peggedCards[i];
                if (i + 1 > numOldPeggedCards) //don't want to add the card if occurred before - but need to look for new goes
                {
                    peggingChanges.Add(PeggingChange.Pegging(peggedCard.Owner, peggedCard.PlayingCard));
                }


                var newGoes = GetNewGoes(oldPegging, newPegging, i);
                peggingChanges.AddRange(newGoes.Select(newGo => PeggingChange.GoChange(newGo.playerId)));
            }

            return peggingChanges;
        }
    }
}
