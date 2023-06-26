#nullable enable

using System;

namespace CribAzureFunctionApp.Utilities
{
    public class IdFactory : IIdFactory
    {
        public string Get()
        {
            return Guid.NewGuid().ToString();
        }
    }
}