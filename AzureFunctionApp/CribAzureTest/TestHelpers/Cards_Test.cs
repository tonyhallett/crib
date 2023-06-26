using CribAzureFunctionApp.Matches.Card;

namespace CribAzureTest.TestHelpers
{
    public class Cards_Test
    {
        [Test]
        public void Cards_Helper_Should_Correctly_Identify_Each_Card_In_Deck()
        {
            var propertyInfos = typeof(Cards).GetProperties();
            Assert.That(propertyInfos.Count, Is.EqualTo(52));
            propertyInfos.ToList().ForEach(propertyInfo =>
            {
                var playingCard = propertyInfo.GetValue(null) as PlayingCard;
                Assert.That($"{playingCard!.Pips}{playingCard!.Suit}", Is.EqualTo(propertyInfo.Name));
            });
        }
    }
}
