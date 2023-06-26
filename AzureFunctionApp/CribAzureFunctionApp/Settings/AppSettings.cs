using System;
using System.Diagnostics.CodeAnalysis;

namespace CribAzureFunctionApp.Settings
{
    [ExcludeFromCodeCoverage]
    public class AppSettings : IAppSettings
    {
        public string Get(string name)
        {
            return Environment.GetEnvironmentVariable(name, EnvironmentVariableTarget.Process);
        }
    }
}