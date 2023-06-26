using System.Collections.Generic;

namespace CribAzureFunctionApp.Matches.Deal
{
    public interface IShuffler<T>
    {
        void Shuffle(T[] toShuffle);
        void Shuffle(List<T> toShuffle);
    }
}