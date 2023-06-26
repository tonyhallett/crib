using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.Scoring.Scorer.Show;
using CribAzureTest.TestHelpers;
using System.Collections;

namespace CribAzureTest.Matches.Scoring.Scorer
{
    public class ShowScoreScoreCases : IEnumerable
    {
        public class ShowScoreScoreCase : TestCaseData
        {
            public ShowScoreScoreCase(ShowScore showScore, int expectedScore) : base(showScore, expectedScore) { }
        }
        public IEnumerator GetEnumerator()
        {
            yield return new ShowScoreScoreCase(new ShowScore(), 0).SetName("ShowScore 0 score");
            yield return new ShowScoreScoreCase(new ShowScore()
            {
                Pairs = new List<Pair> { new Pair(Cards.SixDiamonds, Cards.SixHearts) }
            }, 2).SetName("ShowScore pair score");
            yield return new ShowScoreScoreCase(new ShowScore()
            {
                Pairs = new List<Pair> {
                    new Pair(Cards.SixDiamonds, Cards.SixHearts),
                    new Pair(Cards.SevenClubs, Cards.SevenDiamonds)
                }
            }, 4).SetName("ShowScore 2 pair score");
            yield return new ShowScoreScoreCase(new ShowScore()
            {
                ThreeOfAKind = new ThreeOfAKind(Cards.AceClubs, Cards.AceDiamonds, Cards.AceSpades)
            }, 6).SetName("ShowScore 3 of a kind");
            yield return new ShowScoreScoreCase(new ShowScore()
            {
                FourOfAKind = new FourOfAKind(Cards.AceClubs, Cards.AceDiamonds, Cards.AceSpades, Cards.AceHearts)
            }, 12).SetName("ShowScore 4 of a kind");
            yield return new ShowScoreScoreCase(new ShowScore()
            {
                OneForHisKnob = Cards.JackDiamonds
            }, 1).SetName("One for his knob");
            yield return new ShowScoreScoreCase(new ShowScore()
            {
                Flush = new List<PlayingCard> { Cards.AceHearts, Cards.TwoHearts, Cards.NineHearts, Cards.JackHearts }
            }, 4).SetName("Four card flush");
            yield return new ShowScoreScoreCase(new ShowScore()
            {
                Flush = new List<PlayingCard> { Cards.AceHearts, Cards.TwoHearts, Cards.NineHearts, Cards.JackHearts, Cards.KingHearts }
            }, 5).SetName("Five card flush");
            yield return new ShowScoreScoreCase(new ShowScore()
            {
                FifteenTwos = new List<List<PlayingCard>>
                {
                    new List<PlayingCard>{ Cards.TenClubs, Cards.FiveSpades}
                }
            }, 2).SetName("Single fifteen two");
            yield return new ShowScoreScoreCase(new ShowScore()
            {
                FifteenTwos = new List<List<PlayingCard>>
                {
                    new List<PlayingCard>{ Cards.TenClubs, Cards.FiveSpades},
                    new List<PlayingCard>{ Cards.SevenClubs, Cards.EightDiamonds}
                }
            }, 4).SetName("Two fifteen two");
            yield return new ShowScoreScoreCase(new ShowScore()
            {
                Runs = new List<List<PlayingCard>>
                {
                    new List<PlayingCard>{ Cards.AceClubs, Cards.TwoClubs, Cards.ThreeClubs}
                }
            }, 3).SetName("Single three card run");
            yield return new ShowScoreScoreCase(new ShowScore()
            {
                Runs = new List<List<PlayingCard>>
                {
                    new List<PlayingCard>{ Cards.AceClubs, Cards.TwoClubs, Cards.ThreeClubs, Cards.FourDiamonds}
                }
            }, 4).SetName("Single four card run");
            yield return new ShowScoreScoreCase(new ShowScore()
            {
                Runs = new List<List<PlayingCard>>
                {
                    new List<PlayingCard>{ Cards.AceClubs, Cards.TwoClubs, Cards.ThreeClubs, Cards.FourDiamonds},
                    new List<PlayingCard>{ Cards.AceClubs, Cards.TwoClubs, Cards.ThreeClubs, Cards.FourDiamonds}
                }
            }, 8).SetName("Two four card run");

        }
    }

    internal class ShowScore_Score_Tests
    {
        [TestCaseSource(typeof(ShowScoreScoreCases))]
        public void Should_Score_Correctly(ShowScore showScore, int expectedScore)
        {
            Assert.That(showScore.Score, Is.EqualTo(expectedScore));
        }
    }
}
