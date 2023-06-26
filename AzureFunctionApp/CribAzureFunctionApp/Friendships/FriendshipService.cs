#nullable enable

using CribAzureFunctionApp.Utilities;
using CribAzureFunctionApp.Verification;

namespace CribAzureFunctionApp.Friendships
{
    public class FriendshipService : IFriendshipService
    {
        private readonly IIdFactory idFactory;
        private readonly IDate date;

        public FriendshipService(IIdFactory idFactory, IDate date)
        {
            this.idFactory = idFactory;
            this.date = date;
        }
        public (Friendship inviterFriendship, Friendship inviteeFriendship) CreateFriendship(string inviterId, string inviteeId)
        {
            var id1 = idFactory.Get();
            var id2 = idFactory.Get();
            var invDate = date.UTCNow();
            var friendship1 = new Friendship(inviterId, inviteeId, FriendshipStatus.Pending, invDate, true, id1, id2);
            var friendship2 = new Friendship(inviteeId, inviterId, FriendshipStatus.Pending, invDate, false, id2, id1);
            return (friendship1, friendship2);
        }

        public void ValidateJsAcceptance(Friendship friendship, string userId)
        {
            if (friendship.IsInviter)
            {
                throw new JsHackingException("You cannot accept friendship where you are the inviter");
            }
            if (friendship.Status != FriendshipStatus.Pending)
            {
                throw new JsHackingException("You can ony accept a pending friendship");
            }
            if (friendship.Player != userId)
            {
                throw new JsHackingException("You are not the invitee of the friendship");
            }
        }

        // either Friendship ( from js id/otherId ) could be invalid

        public void ValidateJsAcceptance(Friendship inviterFriendship, Friendship inviteeFriendship, string userId)
        {
            if (inviterFriendship.OtherId != inviteeFriendship.Id)
            {
                throw new JsHackingException("Invalid id");
            }

            ValidateJsAcceptance(inviteeFriendship, userId);
        }
    }
}