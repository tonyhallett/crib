using Moq;
using CribAzureFunctionApp.Matches.Utilities;
using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.State;
using CribAzureFunctionApp.Matches.Scoring.Match.Utilities;
using CribAzureTest.TestHelpers;

namespace CribAzureTest.Matches.Scoring.Match.Utilities
{
    internal class HandReconstructor_Tests
    {
        [TestCase(true)]
        [TestCase(false)]
        public void Should_Reconstruct_Ordered_By_Turn_Number(bool player1First)
        {
            var mockNextPlayer = new Mock<INextPlayer>();
            mockNextPlayer.Setup(nextPlayer => nextPlayer.Turns("dealerid", new List<string> { "p1", "p2" })).Returns(player1First ? new List<string> { "p1", "p2" } : new List<string> { "p2", "p1" });


            var pegging = new Pegging(new List<PeggedCard> { new PeggedCard("p1", Cards.AceClubs, Empty.PegScoring) }, new List<PeggedCard> { new PeggedCard("p2", Cards.AceHearts, Empty.PegScoring) }, "", Empty.CannotGoes, Empty.GoHistory);


            var handReconstructor = new HandReconstructor(mockNextPlayer.Object);
            var reconstructed = handReconstructor.Reconstruct(pegging, "dealerid", new List<string> { "p1", "p2" }).ToList();


            var expectedPlayer1 = ("p1", new List<PlayingCard> { Cards.AceClubs });
            var expectedPlayer2 = ("p2", new List<PlayingCard> { Cards.AceHearts });

            Assert.That(
                reconstructed,
                Is.EqualTo(new List<(string, IEnumerable<PlayingCard>)> {
                    player1First ? expectedPlayer1 : expectedPlayer2,
                    player1First ? expectedPlayer2 : expectedPlayer1
                })
            );

        }
    }
}
