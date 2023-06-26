#nullable enable

using CribAzureFunctionApp;
using CribAzureFunctionApp.Matches.Card;

namespace CribAzureFunctionApp.Matches.Deal
{
    public interface IDeck
    {
        PlayingCard[] GetCards();
    }
}