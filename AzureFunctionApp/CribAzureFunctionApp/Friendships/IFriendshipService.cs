#nullable enable

namespace CribAzureFunctionApp.Friendships
{
    public interface IFriendshipService
    {
        (Friendship inviterFriendship, Friendship inviteeFriendship) CreateFriendship(string inviterId, string inviteeId);
        void ValidateJsAcceptance(Friendship friendship, string userId);
        void ValidateJsAcceptance(Friendship inviterFriendship, Friendship inviteeFriendship, string userId);
    }
}