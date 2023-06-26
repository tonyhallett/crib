using Microsoft.Azure.Cosmos;
using Microsoft.Azure.SignalR.Management;
using Moq;

namespace CribAzureTest.TestHelpers
{
    public static class AzureMocks
    {
        public static ItemResponse<T> ItemResponse<T>(T resource)
        {
            var mockItemResponse = new Mock<ItemResponse<T>>();
            mockItemResponse.SetupGet(itemResponse => itemResponse.Resource).Returns(resource);
            return mockItemResponse.Object;
        }

        //public static Container ContainerLinqQueryable<T, TKey>(List<T> items, Expression<Func<T, TKey>> keySelector)
        //{
        //    var mockContainer = new Mock<Container>();
        //    var queryable = items.AsQueryable().OrderBy(keySelector);
        //    mockContainer.Setup(container => container.GetItemLinqQueryable<T>(false, null, null, null))
        //        .Returns(queryable);

        //    return mockContainer.Object;
        //}

        public static (ServiceHubContext<TClient>, Mock<TClient>) ServiceHubContextUser<TClient>(string userId) where TClient : class
        {
            var mockServiceHubContext = new Mock<ServiceHubContext<TClient>>();
            var mockClient = new Mock<TClient>();
            mockServiceHubContext.Setup(shc => shc.Clients.User(userId)).Returns(mockClient.Object);

            return (mockServiceHubContext.Object, mockClient);

        }

        public static (ServiceHubContext<TClient>, List<Mock<TClient>>) ServiceHubContextAllUsers<TClient>(List<string> userIds) where TClient : class
        {
            var mockServiceHubContext = new Mock<ServiceHubContext<TClient>>();
            var mockClients = userIds.Select(userId =>
            {
                var mockClient = new Mock<TClient>();
                mockServiceHubContext.Setup(shc => shc.Clients.User(userId)).Returns(mockClient.Object);
                return mockClient;
            }).ToList();


            return (mockServiceHubContext.Object, mockClients);

        }

        public static ServiceHubContext<TClient> ServiceHubContextAnyUser<TClient>() where TClient : class
        {
            var mockServiceHubContext = new Mock<ServiceHubContext<TClient>>();
            var mockClient = new Mock<TClient>();
            mockServiceHubContext.Setup(shc => shc.Clients.User(It.IsAny<string>())).Returns(mockClient.Object);

            return mockServiceHubContext.Object;

        }
    }
}
