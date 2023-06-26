using System.Collections;
using CribAzureFunctionApp.Matches.Change;
using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Verification;
using CribAzureFunctionApp.Matches.State;
using CribAzureTest.TestHelpers;

namespace CribAzureTest.Matches.Change
{
    internal class MatchVerifier_Tests
    {
        [Test]
        public void VerifyDiscard_Should_Throw_If_Not_Match_Player()
        {
            IMatchVerifier matchVerifier = new MatchVerifier();

            var cribMatch = new CribMatch(
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Discard,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "3",
                "id", Empty.ChangeHistory, "", null
            );
            var exception = Assert.Throws<JsHackingException>(() => matchVerifier.VerifyDiscard(cribMatch, "notaplayer", Cards.SixDiamonds, Cards.FiveDiamonds));
            Assert.That(exception.Message, Is.EqualTo("Not a player"));

        }

        [Test]
        public void VerifyDiscard_Should_Throw_If_GameState_Not_Discard()
        {
            IMatchVerifier matchVerifier = new MatchVerifier();

            var cribMatch = new CribMatch(
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "3",
                "id", Empty.ChangeHistory, "", null
            );
            var exception = Assert.Throws<JsHackingException>(() => matchVerifier.VerifyDiscard(cribMatch, "p1", Cards.SixDiamonds, Cards.FiveDiamonds));
            Assert.That(exception.Message, Is.EqualTo("Cannot discard when game state is Pegging"));

        }

        public class IncorrectNumberDiscardCases : IEnumerable
        {
            public IEnumerator GetEnumerator()
            {
                yield return new TestCaseData(
                    Empty.MatchPlayer(""),
                    null,
                    null
                ).SetName("Two players");

                yield return new TestCaseData(
                    Empty.MatchPlayer(""),
                    Empty.MatchPlayer(""),
                    null
                ).SetName("Three players");

                yield return new TestCaseData(
                    Empty.MatchPlayer(""),
                    Empty.MatchPlayer(""),
                    Empty.MatchPlayer("")
                ).SetName("Four players");
            }
        }

        [TestCaseSource(typeof(IncorrectNumberDiscardCases))]
        public void VerifyDiscard_Should_Throw_If_Incorrect_Number_Of_Discards(
            MatchPlayer player2,
            MatchPlayer? player3,
            MatchPlayer? player4
        )
        {
            IMatchVerifier matchVerifier = new MatchVerifier();

            var cribMatch = new CribMatch(
                Empty.MatchPlayer("p1"),
                player2,
                player3,
                player4,
                CribGameState.Discard,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "3",
                "id", Empty.ChangeHistory, "", null
            );

            if (player3 == null)
            {
                var exception = Assert.Throws<JsHackingException>(() => matchVerifier.VerifyDiscard(cribMatch, "p1", Cards.SixDiamonds, null));
                Assert.That(exception.Message, Is.EqualTo("Expected 2 discards"));
            }
            else
            {
                var exception = Assert.Throws<JsHackingException>(() => matchVerifier.VerifyDiscard(cribMatch, "p1", Cards.SixDiamonds, Cards.FiveDiamonds));
                Assert.That(exception.Message, Is.EqualTo("Expected 1 discard"));
            }
        }

        [Test]
        public void VerifyDiscard_Should_Throw_If_Discard_Not_Player_Card()
        {
            IMatchVerifier matchVerifier = new MatchVerifier();

            var cribMatch = new CribMatch(
                Empty.MatchPlayer("p1"),
                Empty.MatchPlayer(""),
                null,
                null,
                CribGameState.Discard,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "3",
                "id", Empty.ChangeHistory, "", null
            );

            var exception = Assert.Throws<JsHackingException>(() => matchVerifier.VerifyDiscard(cribMatch, "p1", Cards.SixDiamonds, Cards.FiveDiamonds));
            Assert.That(exception.Message, Is.EqualTo("Card SixDiamonds is not your card"));

            exception = Assert.Throws<JsHackingException>(() => matchVerifier.VerifyDiscard(cribMatch, "p1", Cards.FiveDiamonds, Cards.SixDiamonds));
            Assert.That(exception.Message, Is.EqualTo("Card FiveDiamonds is not your card"));
        }

        [Test]
        public void VerifyDiscard_Should_Not_Throw_For_Legitimate_Discard()
        {
            IMatchVerifier matchVerifier = new MatchVerifier();

            var cribMatch = new CribMatch(
                new MatchPlayer("p1", new List<PlayingCard> { Cards.FiveDiamonds, Cards.SixDiamonds }, false, Empty.HandAndBoxScoringHistory),
                Empty.MatchPlayer(""),
                null,
                null,
                CribGameState.Discard,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "3",
                "id", Empty.ChangeHistory, "", null
            );


            matchVerifier.VerifyDiscard(cribMatch, "p1", Cards.FiveDiamonds, Cards.SixDiamonds);
        }


        [Test]
        public void VerifyPegging_Should_Throw_If_Not_A_Match_Player()
        {
            IMatchVerifier matchVerifier = new MatchVerifier();

            var cribMatch = new CribMatch(
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            var exception = Assert.Throws<JsHackingException>(() => matchVerifier.VerifyPegging(cribMatch, "notaplayer", Cards.SixDiamonds));
            Assert.That(exception.Message, Is.EqualTo("Not a player"));
        }

        [Test]
        public void VerifyPegging_Should_Throw_If_Not_The_Next_Player()
        {
            IMatchVerifier matchVerifier = new MatchVerifier();

            var cribMatch = new CribMatch(
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            var exception = Assert.Throws<JsHackingException>(() => matchVerifier.VerifyPegging(cribMatch, "p1", Cards.SixDiamonds));
            Assert.That(exception.Message, Is.EqualTo("You are not the next player"));
        }

        [Test]
        public void VerifyPegging_Should_Throw_If_GameState_Is_Not_Pegging()
        {
            IMatchVerifier matchVerifier = new MatchVerifier();

            var cribMatch = new CribMatch(
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Discard,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                new Pegging(Empty.PeggedCards, Empty.PeggedCards, "p1", Empty.CannotGoes, Empty.GoHistory),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            var exception = Assert.Throws<JsHackingException>(() => matchVerifier.VerifyPegging(cribMatch, "p1", Cards.SixDiamonds));
            Assert.That(exception.Message, Is.EqualTo("Cannot peg when game state is Discard"));
        }

        [Test]
        public void VerifyPegging_Should_Throw_If_Card_Is_Not_In_Hand()
        {
            IMatchVerifier matchVerifier = new MatchVerifier();

            var cribMatch = new CribMatch(
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                new Pegging(Empty.PeggedCards, Empty.PeggedCards, "p1", Empty.CannotGoes, Empty.GoHistory),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            var exception = Assert.Throws<JsHackingException>(() => matchVerifier.VerifyPegging(cribMatch, "p1", Cards.SixDiamonds));
            Assert.That(exception.Message, Is.EqualTo("Card SixDiamonds is not your card"));
        }

        [Test]
        public void VerifyPegging_Should_Throw_If_Pegs_Past_31()
        {
            IMatchVerifier matchVerifier = new MatchVerifier();
            var inPlayCards = new List<PeggedCard> {
                new PeggedCard("", Cards.JackHearts, Empty.PegScoring),
                new PeggedCard("", Cards.QueenHearts, Empty.PegScoring),
                new PeggedCard("", Cards.TwoDiamonds, Empty.PegScoring) };
            var cribMatch = new CribMatch(
                new MatchPlayer("p1", new List<PlayingCard> { Cards.KingHearts }, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                new Pegging(Empty.PeggedCards, inPlayCards, "p1", Empty.CannotGoes, Empty.GoHistory),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            var exception = Assert.Throws<JsHackingException>(() => matchVerifier.VerifyPegging(cribMatch, "p1", Cards.KingHearts));
            Assert.That(exception.Message, Is.EqualTo("Pegging more than 31"));
        }

        [Test]
        public void VerifyPegging_Should_Not_Throw_For_Legitimate_Pegging()
        {
            IMatchVerifier matchVerifier = new MatchVerifier();
            var inPlayCards = new List<PeggedCard> {
                new PeggedCard("", Cards.JackHearts, Empty.PegScoring),
                new PeggedCard("", Cards.AceHearts, Empty.PegScoring),
                new PeggedCard("", Cards.TwoDiamonds, Empty.PegScoring) };
            var cribMatch = new CribMatch(
                new MatchPlayer("p1", new List<PlayingCard> { Cards.KingHearts }, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                new Pegging(Empty.PeggedCards, inPlayCards, "p1", Empty.CannotGoes, Empty.GoHistory),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            matchVerifier.VerifyPegging(cribMatch, "p1", Cards.KingHearts);
        }

        [Test]
        public void VerifyGo_Should_Throw_If_Not_A_Match_Player()
        {
            IMatchVerifier matchVerifier = new MatchVerifier();

            var cribMatch = new CribMatch(
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p2", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Discard,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            var exception = Assert.Throws<JsHackingException>(() => matchVerifier.VerifyGo(cribMatch, "notaplayer"));
            Assert.That(exception.Message, Is.EqualTo("Not a player"));
        }

        [Test]
        public void VerifyGo_Should_Throw_If_Not_the_Next_Player()
        {
            IMatchVerifier matchVerifier = new MatchVerifier();

            var cribMatch = new CribMatch(
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p2", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Discard,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            var exception = Assert.Throws<JsHackingException>(() => matchVerifier.VerifyGo(cribMatch, "p1"));
            Assert.That(exception.Message, Is.EqualTo("You are not the next player"));
        }

        [Test]
        public void VerifyGo_Should_Throw_If_Not_Pegging()
        {
            IMatchVerifier matchVerifier = new MatchVerifier();

            var cribMatch = new CribMatch(
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Discard,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                new Pegging(Empty.PeggedCards, Empty.PeggedCards, "p1", Empty.CannotGoes, Empty.GoHistory),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            var exception = Assert.Throws<JsHackingException>(() => matchVerifier.VerifyGo(cribMatch, "p1"));
            Assert.That(exception.Message, Is.EqualTo("Cannot peg when game state is Discard"));
        }

        [Test]
        public void VerifyGo_Should_Throw_If_Can_Go()
        {
            IMatchVerifier matchVerifier = new MatchVerifier();

            var cribMatch = new CribMatch(
                new MatchPlayer("p1", new List<PlayingCard> { Cards.AceDiamonds }, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                new Pegging(Empty.PeggedCards, Empty.PeggedCards, "p1", Empty.CannotGoes, Empty.GoHistory),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            var exception = Assert.Throws<JsHackingException>(() => matchVerifier.VerifyGo(cribMatch, "p1"));
            Assert.That(exception.Message, Is.EqualTo("You can go"));
        }

        [Test]
        public void VerifyGo_Should_Not_Throw_If_Passes_Verification()
        {
            IMatchVerifier matchVerifier = new MatchVerifier();

            var cribMatch = new CribMatch(
                new MatchPlayer("p1", new List<PlayingCard> { Cards.TwoDiamonds }, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Pegging,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                new Pegging(Empty.PeggedCards, new List<PeggedCard> {
                    new PeggedCard("",Cards.KingHearts,Empty.PegScoring),
                    new PeggedCard("", Cards.JackHearts, Empty.PegScoring),
                    new PeggedCard("", Cards.QueenHearts, Empty.PegScoring)
                }, "p1", Empty.CannotGoes, Empty.GoHistory),
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            matchVerifier.VerifyGo(cribMatch, "p1");

        }

        [Test]
        public void VerifyReady_Should_Throw_If_Not_A_Game_Player()
        {
            IMatchVerifier matchVerifier = new MatchVerifier();

            var cribMatch = new CribMatch(
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p2", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                CribGameState.Discard,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "3", "id", Empty.ChangeHistory, "", null
            );
            var exception = Assert.Throws<JsHackingException>(() => matchVerifier.VerifyReady(cribMatch, "notaplayer"));
            Assert.That(exception.Message, Is.EqualTo("Not a player"));
        }

        [TestCase(CribGameState.Discard)]
        [TestCase(CribGameState.Pegging)]
        public void VerifyReady_Should_Throw_If_Not_In_A_Ready_State(CribGameState notAReadyState)
        {
            IMatchVerifier matchVerifier = new MatchVerifier();

            var cribMatch = new CribMatch(
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p2", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                notAReadyState,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "3",
                "id", Empty.ChangeHistory, "", null
            );
            var exception = Assert.Throws<JsHackingException>(() => matchVerifier.VerifyReady(cribMatch, "p1"));
            Assert.That(exception.Message, Is.EqualTo("Not in a ready state"));
        }

        [TestCase(CribGameState.Show)]
        [TestCase(CribGameState.GameWon)]
        [TestCase(CribGameState.MatchWon)]
        public void VerifyReady_Should_Not_Throw_If_In_A_Ready_State(CribGameState readyState)
        {
            IMatchVerifier matchVerifier = new MatchVerifier();

            var cribMatch = new CribMatch(
                new MatchPlayer("p1", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                new MatchPlayer("p2", Empty.Cards, false, Empty.HandAndBoxScoringHistory),
                null,
                null,
                readyState,
                Cards.AceDiamonds,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "3",
                "id", Empty.ChangeHistory, "", null
            );
            matchVerifier.VerifyReady(cribMatch, "p1");
        }
    }
}
