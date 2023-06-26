#nullable enable

using Microsoft.Azure.Cosmos;
using System.Threading.Tasks;

namespace CribAzureFunctionApp.Cosmos
{
    internal static class ContainerExtensions
    {
        public async static Task<T?> TryReadItemAsync<T>(this Container container, string id, PartitionKey partitionKey) where T : class
        {
            T? item = null;
            try
            {
                item = await container.ReadItemAsync<T>(id, partitionKey);
            }
            catch (CosmosException exc)
            {
                if (exc.StatusCode != System.Net.HttpStatusCode.NotFound)
                {
                    throw exc;
                }
            }
            return item;
        }
    }
}