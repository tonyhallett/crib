using CribAzureFunctionApp.Cosmos;
using Microsoft.Azure.Cosmos;
using Moq;

namespace CribAzureTest.Cosmos
{
    public class ContainerExtensions_Tests
    {
        [Test]
        public void Should_Throw_For_Non_CosmosException()
        {
            var mockContainer = new Mock<Container>();
            var exception = new Exception();
            mockContainer.Setup(container => container.ReadItemAsync<Player>("", new PartitionKey(""), null, CancellationToken.None))
                .Throws(exception);
            var thrownException = Assert.ThrowsAsync<Exception>(async () => await mockContainer.Object.TryReadItemAsync<Player>("", new PartitionKey("")));
            Assert.That(thrownException, Is.SameAs(exception));
        }

        [Test]
        public void Should_Throw_If_Status_Code_Is_Not_NotFound()
        {
            var mockContainer = new Mock<Container>();
            var cosmosException = new CosmosException("", System.Net.HttpStatusCode.Unauthorized, 0, "", 0);
            mockContainer.Setup(container => container.ReadItemAsync<Player>("", new PartitionKey(""), null, CancellationToken.None))
                .Throws(cosmosException);
            var thrownException = Assert.ThrowsAsync<CosmosException>(async () => await mockContainer.Object.TryReadItemAsync<Player>("", new PartitionKey("")));
            Assert.That(thrownException, Is.SameAs(cosmosException));
        }
    }
}


