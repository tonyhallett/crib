using System.Collections.Generic;

namespace CribAzureFunctionApp.Cosmos
{
    public record Player(string id, List<string> matchIds) { }
}