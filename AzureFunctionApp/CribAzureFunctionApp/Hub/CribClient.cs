#nullable enable

using CribAzureFunctionApp.Friendships;
using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.MyMatches;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CribAzureFunctionApp.Hub
{

#pragma warning disable IDE1006 // Naming Styles
    public interface CribClient

    {
        Task discard(string playerId, MyMatch myMatch);
        Task ready(string playerId, MyMatch myMatch);
        Task peg(string playerId, PlayingCard peggedCard, MyMatch myMatch);
        Task friendRequest(Friendship friendship);
        Task friendRequestAccepted(Friendship inviterFriendship);
        Task initialPlayerData(List<Friendship> myFriends, List<MyMatch> matches);
        Task matchCreated(MyMatch match);
        Task sentFriendRequests(List<Friendship> inviterFriendships);
    }
#pragma warning restore IDE1006 // Naming Styles
}