using Microsoft.Azure.Cosmos;
using Moq;
using System.Diagnostics.CodeAnalysis;

namespace CribAzureTest.TestHelpers
{
    public static class Its
    {
        public static List<T> ListLike<T>(List<T> likeList) => Match.Create<List<T>>(list =>
        {
            if (list.Count != likeList.Count)
            {
                return false;
            }

            for (var i = 0; i < list.Count; i++)
            {
#pragma warning disable CS8602 // Dereference of a possibly null reference.
                if (!list[i].Equals(likeList[i]))
                {
                    return false;
                }
#pragma warning restore CS8602 // Dereference of a possibly null reference.
            }
            return true;
        });

        [ExcludeFromCodeCoverage]
        public static QueryRequestOptions QueryRequestOptionsArePartitioned(PartitionKey partitionKey) => Match.Create<QueryRequestOptions>(qro =>
        {
            return qro.PartitionKey == partitionKey;
        });
    }
}
