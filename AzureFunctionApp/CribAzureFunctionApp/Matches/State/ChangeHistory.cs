#nullable enable

using System;

namespace CribAzureFunctionApp.Matches.State
{
    public record ChangeHistory(DateTime MatchCreationDate, DateTime LastChangeDate, int NumberOfActions);

}