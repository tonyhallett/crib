using Microsoft.Azure.Cosmos;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;

namespace CribAzureFunctionApp.Cosmos
{
    [ExcludeFromCodeCoverage]
    public static class FeedIteratorExtensions
    {
        public static async Task<List<T>> GetAllAsync<T>(this FeedIterator<T> feedIterator)
        {
            var results = new List<T>();
            while (feedIterator.HasMoreResults)
            {
                results.AddRange(await feedIterator.ReadNextAsync());
            }
            return results;
        }
    }
}