#nullable enable

using System.Collections.Generic;
using System.Linq;

namespace CribAzureFunctionApp.Utilities
{
    // use distinct and factorial and ordered to test ?
    public class Permuter<T>
    {
        private void CombinationUtil(
            IList<T> arr,
            int n,
            int r,
            int index,
            T[] data,
            int i,
            List<List<T>> container
        )
        {
            if (index == r)
            {
                container.Add(data.ToList());
                return;
            }

            if (i >= n) return;

            data[index] = arr[i];
            CombinationUtil(arr, n, r, index + 1, data, i + 1, container);

            CombinationUtil(arr, n, r, index, data, i + 1, container);
        }
        public List<List<T>> Permute(IList<T> input, int count)
        {
            var array = new T[count];

            var result = new List<List<T>>();
            CombinationUtil(input, input.Count, count, 0, array, 0, result);
            return result;
        }
    }

}