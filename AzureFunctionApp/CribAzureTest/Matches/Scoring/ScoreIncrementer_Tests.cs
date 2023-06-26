using CribAzureFunctionApp.Matches.Scoring;

namespace CribAzureTest.Matches.Scoring
{
    internal class ScoreIncrementer_Tests
    {
        [TestCase(1)]
        [TestCase(2)]
        public void Should_Increment_Front_Peg_Only_When_Initial_Score(int increment)
        {
            var scoreIncrementer = new ScoreIncrementer();
            var initialScore = new Score(0, 0, 0);
            scoreIncrementer.Increment(initialScore, increment);

            Assert.That(initialScore, Is.EqualTo(new Score(0, increment, 0)));
        }

        [TestCase(1)]
        [TestCase(2)]
        public void Should_Increment_Front_And_Back_Peg_When_Has_Already_Scored(int increment)
        {
            var scoreIncrementer = new ScoreIncrementer();
            var score = new Score(0, 2, 0);
            scoreIncrementer.Increment(score, increment);

            Assert.That(score, Is.EqualTo(new Score(0, 2 + increment, 0 + increment)));
        }

        [TestCase(1)]
        [TestCase(2)]
        public void Should_Increment_Match_Score_Resetting_Pegs_When_Match_Won(int increment)
        {
            var scoreIncrementer = new ScoreIncrementer();
            var score = new Score(0, 120, 119);
            scoreIncrementer.Increment(score, increment);

            Assert.That(score, Is.EqualTo(new Score(1, 0, 0)));
        }
    }
}
