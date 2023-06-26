using CribAzureFunctionApp.Matches.State;

namespace CribAzureTest.Matches.State
{
    public class Pegging_Tests
    {
        [Test]
        public void AllCanGo_Should_All_Be_False()
        {
            var canGoes = Pegging.AllCanGo(2);
            Assert.That(canGoes, Is.EqualTo(new List<bool> { false, false }));

            canGoes = Pegging.AllCanGo(3);
            Assert.That(canGoes, Is.EqualTo(new List<bool> { false, false, false }));

            canGoes = Pegging.AllCanGo(4);
            Assert.That(canGoes, Is.EqualTo(new List<bool> { false, false, false, false }));
        }
    }
}
