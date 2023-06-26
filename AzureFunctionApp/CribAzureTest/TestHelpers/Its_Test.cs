using Moq;

namespace CribAzureTest.TestHelpers
{
    public class Its_Test
    {
        public interface IMockedType
        {
            void MethodWithListArg(List<int> list);
        }

        [Test]
        public void ListLike_Should_Work_As_Expected()
        {
            Its.ListLike(new List<int> { 1, 2, 3 });

            var mock = new Mock<IMockedType>();
            mock.Setup(m => m.MethodWithListArg(Its.ListLike(new List<int> { 1, 2, 3 })));

            mock.Object.MethodWithListArg(new List<int> { });
            Assert.That(mock.Invocations[0].MatchingSetup, Is.Null);

            mock.Object.MethodWithListArg(new List<int> { 1, 3, 2 });
            Assert.That(mock.Invocations[1].MatchingSetup, Is.Null);

            mock.Object.MethodWithListArg(new List<int> { 1, 2, 3 });
            Assert.That(mock.Invocations[2].MatchingSetup, Is.Not.Null);
        }
    }
}
