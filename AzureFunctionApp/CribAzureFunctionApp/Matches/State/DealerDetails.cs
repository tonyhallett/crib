#nullable enable

using System;

namespace CribAzureFunctionApp.Matches.State
{
    public class DealerDetails : IEquatable<DealerDetails>
    {
        public DealerDetails(string first, string current)
        {
            First = first;
            Current = current;
        }
        public string First { get; set; }
        public string Current { get; set; }

        public bool Equals(DealerDetails? other)
        {
            if (other == null) return false;
            return other.First == First && other.Current == Current;
        }
    }
}