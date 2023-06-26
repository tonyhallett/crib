using Microsoft.Azure.Cosmos;
using Moq;

internal static class CribMocks
{
    public static (CosmosClient cosmosClient, Mock<Container> mockContainers) MockContainer(string containerName)
    {
        var (cosmosClient, mockContainers) = MockContainers(containerName);

        return (cosmosClient, mockContainers[0]);

    }
    public static (CosmosClient cosmosClient,List<Mock<Container>> mockContainers) MockContainers(params string[] containerNames)
    {
        var mockCosmosClient = new Mock<CosmosClient>();
        var mockContainers = containerNames.Select(containerName =>
        {
            var mockContainer = new Mock<Container>();
            mockCosmosClient.Setup(cosmosClient => cosmosClient.GetDatabase("Crib").GetContainer(containerName))
                .Returns(mockContainer.Object);
            return mockContainer;

        }).ToList();
        
        return (mockCosmosClient.Object, mockContainers);

    }
}


