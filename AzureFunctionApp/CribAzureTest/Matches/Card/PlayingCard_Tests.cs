using CribAzureTest.TestHelpers;

namespace CribAzureTest.Matches.Card
{
    internal class PlayingCard_Tests
    {
        [Test]
        public void Should_Have_Correct_Value()
        {
            Assert.Multiple(() =>
            {
                Assert.That(Cards.KingHearts.Value(), Is.EqualTo(10));
                Assert.That(Cards.QueenHearts.Value(), Is.EqualTo(10));
                Assert.That(Cards.JackHearts.Value(), Is.EqualTo(10));

                Assert.That(Cards.AceHearts.Value(), Is.EqualTo(1));
                Assert.That(Cards.TwoDiamonds.Value(), Is.EqualTo(2));
            });
        }
    }
}
