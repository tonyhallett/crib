using Microsoft.Azure.Cosmos.Linq;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

namespace CribAzureFunctionApp.Cosmos
{
    [ExcludeFromCodeCoverage]
    public class FeedIterator : IFeedIterator
    {
        public Task<List<T>> GetAllAsync<T>(IQueryable<T> query)
        {
            return query.ToFeedIterator().GetAllAsync();
        }
    }
}