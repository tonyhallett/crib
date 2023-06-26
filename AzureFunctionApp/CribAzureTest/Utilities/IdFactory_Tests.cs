using CribAzureFunctionApp.Utilities;

namespace CribAzureTest.Utilities
{
    internal class IdFactory_Tests
    {
        [Test]
        public void Should_Create_Unique_Ids()
        {
            var idFactory = new IdFactory();
            var first = idFactory.Get();
            var second = idFactory.Get();

            Assert.That(first, Is.Not.EqualTo(second));
        }

        [Test]
        public void Should_Create_Id_That_Does_Not_Exceed_255_Characters()
        {
            var idFactory = new IdFactory();

            Assert.That(idFactory.Get(), Has.Length.LessThanOrEqualTo(255));
        }
    }
}
