#nullable enable

using System;

namespace CribAzureFunctionApp.Utilities
{
    public interface IDate
    {
        DateTime UTCNow();
    }
}