using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;

namespace CribAzureFunctionApp.Matches.Deal
{
    [ExcludeFromCodeCoverage]
    public class Shuffler<T> : IShuffler<T>
    {
        private readonly Random r = new();
        public void Shuffle(T[] toShuffle)
        {
            for (var i = 0; i < toShuffle.Length; i++)
            {
                var idx = r.Next(i, toShuffle.Length);
                (toShuffle[i], toShuffle[idx]) = (toShuffle[idx], toShuffle[i]);
                /*
                    var idx = r.Next(i, toShuffle.Length);
                    T temp = toShuffle[idx];
                    toShuffle[idx] = toShuffle[i];
                    toShuffle[i] = temp;
                */
            }
        }

        public void Shuffle(List<T> toShuffle)
        {
            for (var i = 0; i < toShuffle.Count; i++)
            {
                var idx = r.Next(i, toShuffle.Count);
                (toShuffle[i], toShuffle[idx]) = (toShuffle[idx], toShuffle[i]);
                /*
                    T temp = toShuffle[idx];
                    toShuffle[idx] = toShuffle[i];
                    toShuffle[i] = temp;
                */
            }
        }
    }
}