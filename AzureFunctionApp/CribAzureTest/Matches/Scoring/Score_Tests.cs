using CribAzureFunctionApp.Matches.Scoring;

namespace CribAzureTest.Matches.Scoring
{
    internal class Score_Tests
    {
        [Test]
        public void Initial_Should_Create_Correct_Number_Of_0_0_0()
        {
            var initialScores = Score.Initial(2);
            Assert.That(initialScores, Is.EqualTo(new List<Score> { new Score(0, 0, 0), new Score(0, 0, 0) }));

            initialScores = Score.Initial(3);
            Assert.That(initialScores, Is.EqualTo(new List<Score> { new Score(0, 0, 0), new Score(0, 0, 0), new Score(0, 0, 0) }));

            initialScores = Score.Initial(4);
            Assert.That(initialScores, Is.EqualTo(new List<Score> { new Score(0, 0, 0), new Score(0, 0, 0), new Score(0, 0, 0), new Score(0, 0, 0) }));
        }
    }
}
