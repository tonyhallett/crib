#nullable enable

using Microsoft.Azure.Cosmos;

namespace CribAzureFunctionApp.Cosmos
{
    public static class CribCosmosClientExtensions
    {
        public static Container GetCribContainer(this CosmosClient cosmosClient, string containerName)
        {
            return cosmosClient.GetCribDatabase().GetContainer(containerName);
        }

        public static Database GetCribDatabase(this CosmosClient cosmosClient)
        {
            return cosmosClient.GetDatabase("Crib");
        }

        public static Container GetMatchesContainer(this CosmosClient cosmosClient)
        {
            return cosmosClient.GetCribContainer("Matches");
        }

        public static Container GetPlayersContainer(this CosmosClient cosmosClient)
        {
            return cosmosClient.GetCribContainer("Players");
        }

        public static Container GetFriendshipsContainer(this CosmosClient cosmosClient)
        {
            return cosmosClient.GetCribContainer("Friendships");
        }
    }
}