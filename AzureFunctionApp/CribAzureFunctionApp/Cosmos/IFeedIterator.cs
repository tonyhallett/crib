using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CribAzureFunctionApp.Cosmos
{
    public interface IFeedIterator
    {
        Task<List<T>> GetAllAsync<T>(IQueryable<T> query);
    }
}