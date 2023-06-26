using CribAzureFunctionApp.Matches.Scoring.Scorer;

namespace CribAzureTest.Matches.Scoring.Scorer
{
    internal class PegScoring_Tests
    {
        void AssertScore(PegScoring pegScoring, int score)
        {
            Assert.That(pegScoring.Score, Is.EqualTo(score));
        }

        [Test]
        public void Should_Score_Two_For_15()
        {
            AssertScore(new PegScoring(false, true, 0, 0, false), 2);
        }

        [Test]
        public void Should_Score_Two_For_31()
        {
            AssertScore(new PegScoring(true, false, 0, 0, false), 2);
        }

        [TestCase(0)]
        [TestCase(1)]
        [TestCase(2)]
        [TestCase(3)]
        [TestCase(4)]
        [TestCase(5)]
        public void Should_Score_One_For_Each_Card_In_Run_3_Or_Above(int numInRun)
        {
            AssertScore(new PegScoring(false, false, numInRun, 0, false), numInRun >= 3 ? numInRun : 0);
        }

        [TestCase(0, 0)]
        [TestCase(1, 0)]
        [TestCase(2, 2)]
        [TestCase(3, 6)]
        [TestCase(4, 12)]
        public void Should_Score_When_More_Than_One_Of_A_Kind(int ofAKind, int expectedScore)
        {
            AssertScore(new PegScoring(false, false, 0, ofAKind, false), expectedScore);
        }

        [TestCase(true)]
        [TestCase(false)]
        public void Should_Score_Last_Go_For_1_When_Not_31(bool is31)
        {
            AssertScore(new PegScoring(is31, false, 0, 0, true), is31 ? 2 : 1);
        }
    }
}
