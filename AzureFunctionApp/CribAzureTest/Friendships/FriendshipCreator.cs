using CribAzureFunctionApp.Friendships;

namespace CribAzureTest.Friendships
{

    internal static class FriendshipCreator
    {
        public static (Friendship, Friendship) CreateFriendship(string inviterId, string inviteeId, FriendshipStatus friendshipStatus = FriendshipStatus.Pending, DateTime? inviteDate = null)
        {
            var invDate = inviteDate ?? DateTime.UtcNow;
            var friendship1 = new Friendship(inviterId, inviteeId, friendshipStatus, invDate, true, "1", "2");
            var friendship2 = new Friendship(inviteeId, inviterId, friendshipStatus, invDate, false, "2", "1");
            return (friendship1, friendship2);
        }
    }
}
