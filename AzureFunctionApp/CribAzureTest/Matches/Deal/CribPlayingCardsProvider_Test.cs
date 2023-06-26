using CribAzureFunctionApp.Matches.Deal;
using Moq;

namespace CribAzureTest.Matches.Deal
{
    public class CribPlayingCardsProvider_Test
    {
        [SetUp]
        public void Setup()
        {
        }

        [TestCase(1)]
        [TestCase(5)]
        public void Should_Throw_For_Incorrect_Number_Of_Players(int numberOfPlayers)
        {
            var playingCardsProvider = new CribPlayingCardsProvider<int>(null);
            Assert.Throws<Exception>(() =>
            {
                playingCardsProvider.Provide(numberOfPlayers, Array.Empty<int>());
            });

        }

        [Test]
        public void Should_Have_The_First_Shuffled_Card_As_The_Cut_Card()
        {
            var mockShuffler = new Mock<IShuffler<int>>();
            mockShuffler.Setup(shuffler => shuffler.Shuffle(It.IsAny<int[]>())).Callback<int[]>(toShuffle =>
            {
                toShuffle[0] = 123;
            });
            var deck = Enumerable.Range(1, 52).ToArray();

            var playingCardsProvider = new CribPlayingCardsProvider<int>(mockShuffler.Object);
            var cribPlayingCards = playingCardsProvider.Provide(2, deck);
            Assert.That(cribPlayingCards.CutCard, Is.EqualTo(123));
        }

        [TestCase(2)]
        [TestCase(3)]
        [TestCase(4)]
        public void Should_Have_Second_Shuffled_Card_In_The_Box_For_Three_Players(int numberOfPlayers)
        {
            var mockShuffler = new Mock<IShuffler<int>>();
            mockShuffler.Setup(shuffler => shuffler.Shuffle(It.IsAny<int[]>())).Callback<int[]>(toShuffle =>
            {
                toShuffle[1] = 123;
            });
            var deck = Enumerable.Range(1, 52).ToArray();

            var playingCardsProvider = new CribPlayingCardsProvider<int>(mockShuffler.Object);
            var cribPlayingCards = playingCardsProvider.Provide(numberOfPlayers, deck);
            var expectedBox = numberOfPlayers == 3 ? new List<int> { 123 } : Enumerable.Empty<int>().ToList();
            Assert.That(cribPlayingCards.Box, Is.EqualTo(expectedBox));
        }

        [TestCase(2, new int[] { 51, 50, 49, 48, 47, 46 }, new int[] { 45, 44, 43, 42, 41, 40 }, new int[] { }, new int[] { })]
        [TestCase(3, new int[] { 50, 49, 48, 47, 46 }, new int[] { 45, 44, 43, 42, 41 }, new int[] { 40, 39, 38, 37, 36 }, new int[] { })]
        [TestCase(4, new int[] { 51, 50, 49, 48, 47 }, new int[] { 46, 45, 44, 43, 42 }, new int[] { 41, 40, 39, 38, 37 }, new int[] { 36, 35, 34, 33, 32 })]
        public void Should_Fill_Player_Hands_With_Approriate_Number_Of_Shuffled_Cards(
            int numberOfPlayers,
            int[] expectedPlayer1Hand,
            int[] expectedPlayer2Hand,
            int[] expectedPlayer3Hand,
            int[] expectedPlayer4Hand
        )
        {
            var mockShuffler = new Mock<IShuffler<int>>();
            mockShuffler.Setup(shuffler => shuffler.Shuffle(It.IsAny<int[]>())).Callback<int[]>(toShuffle =>
            {
                Array.Reverse(toShuffle);
            });
            var deck = Enumerable.Range(1, 52).ToArray();

            var playingCardsProvider = new CribPlayingCardsProvider<int>(mockShuffler.Object);
            var cribPlayingCards = playingCardsProvider.Provide(numberOfPlayers, deck);
            Assert.Multiple(() =>
            {
                Assert.That(cribPlayingCards.Player1Cards, Is.EqualTo(expectedPlayer1Hand));
                Assert.That(cribPlayingCards.Player2Cards, Is.EqualTo(expectedPlayer2Hand));
                Assert.That(cribPlayingCards.Player3Cards, Is.EqualTo(expectedPlayer3Hand));
                Assert.That(cribPlayingCards.Player4Cards, Is.EqualTo(expectedPlayer4Hand));
            });
        }
    }
}