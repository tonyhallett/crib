#nullable enable

using System;
using System.Collections.Generic;

namespace CribAzureFunctionApp.Utilities
{
    public static class EnumerableExtensions
    {
        public static bool All<T>(this IEnumerable<T> enumerable, Func<T, int, bool> predicate)
        {
            var count = 0;
            foreach (var item in enumerable)
            {
                if (!predicate(item, count))
                {
                    return false;
                }
                count++;
            }
            return true;
        }
    }
}
