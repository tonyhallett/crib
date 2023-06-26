#nullable enable

using System;
using System.Diagnostics.CodeAnalysis;

namespace CribAzureFunctionApp.Utilities
{
    [ExcludeFromCodeCoverage]
    public class Date : IDate
    {
        public DateTime UTCNow()
        {
            return DateTime.UtcNow;
        }
    }
}