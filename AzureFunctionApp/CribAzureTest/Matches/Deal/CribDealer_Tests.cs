using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.Deal;
using CribAzureTest.TestHelpers;
using Moq;

namespace CribAzureTest.Matches.Deal
{
    internal class CribDealer_Tests
    {
        [Test]
        public void Should_Return_The_Provided_Crib_Playing_Cards_From_The_Deck()
        {

            var mockDeck = new Mock<IDeck>();
            var cardsInDeck = new PlayingCard[] { Cards.AceHearts };
            mockDeck.Setup(deck => deck.GetCards()).Returns(cardsInDeck);

            var cribPlayingCards = new Mock<ICribPlayingCards<PlayingCard>>().Object;
            var mockPlayingCardsProvider = new Mock<ICribPlayingCardsProvider<PlayingCard>>();
            mockPlayingCardsProvider.Setup(playingCardsProvider => playingCardsProvider.Provide(3, cardsInDeck)).Returns(cribPlayingCards);

            var cribDealer = new CribDealer(mockPlayingCardsProvider.Object, mockDeck.Object);

            Assert.That(cribDealer.Deal(3), Is.SameAs(cribPlayingCards));
        }
    }
}
