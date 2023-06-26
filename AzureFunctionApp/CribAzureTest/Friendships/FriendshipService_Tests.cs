using CribAzureFunctionApp.Friendships;
using CribAzureFunctionApp.Utilities;
using CribAzureFunctionApp.Verification;
using Moq;

namespace CribAzureTest.Friendships
{
    internal class FriendshipService_CreateFriendship_Tests
    {
        [Test]
        public void Should_Create_Both_Sides_Of_A_Friendship()
        {
            var friendshipService = new FriendshipService(new Mock<IIdFactory>().Object, new Mock<IDate>().Object);

            var (inviterFriendship, inviteeFriendship) = friendshipService.CreateFriendship("inviter", "invitee");
            Assert.Multiple(() =>
            {
                Assert.That(inviterFriendship.Player, Is.EqualTo("inviter"));
                Assert.That(inviterFriendship.IsInviter, Is.True);
                Assert.That(inviterFriendship.Friend, Is.EqualTo("invitee"));
                Assert.That(inviteeFriendship.Player, Is.EqualTo("invitee"));
                Assert.That(inviteeFriendship.IsInviter, Is.False);
                Assert.That(inviteeFriendship.Friend, Is.EqualTo("inviter"));
            });
        }

        [Test]
        public void Should_Refer_To_The_Other_Side_Of_A_Friendship()
        {
            var mockIdFactory = new Mock<IIdFactory>();
            mockIdFactory.SetupSequence(idFactory => idFactory.Get()).Returns("first").Returns("second");
            var friendshipService = new FriendshipService(mockIdFactory.Object, new Mock<IDate>().Object);

            var (inviterFriendship, inviteeFriendship) = friendshipService.CreateFriendship("inviter", "invitee");
            Assert.Multiple(() =>
            {
                Assert.That(inviterFriendship.Id, Is.EqualTo("first"));
                Assert.That(inviterFriendship.OtherId, Is.EqualTo("second"));
                Assert.That(inviteeFriendship.Id, Is.EqualTo("second"));
                Assert.That(inviteeFriendship.OtherId, Is.EqualTo("first"));
            });
        }

        [Test]
        public void Should_Have_InviteDate_For_Both_Sides_As_UTCNow()
        {
            var mockDate = new Mock<IDate>();
            var utcNow = DateTime.UtcNow;
            mockDate.Setup(date => date.UTCNow()).Returns(utcNow);
            var friendshipService = new FriendshipService(new Mock<IIdFactory>().Object, mockDate.Object);

            var (inviterFriendship, inviteeFriendship) = friendshipService.CreateFriendship("inviter", "invitee");
            Assert.Multiple(() =>
            {
                Assert.That(inviterFriendship.InviteDate, Is.EqualTo(utcNow));
                Assert.That(inviteeFriendship.InviteDate, Is.EqualTo(utcNow));
            });
        }

        [Test]
        public void Should_Have_Both_Sides_In_Pending_State()
        {
            var friendshipService = new FriendshipService(new Mock<IIdFactory>().Object, new Mock<IDate>().Object);

            var (inviterFriendship, inviteeFriendship) = friendshipService.CreateFriendship("inviter", "invitee");
            Assert.Multiple(() =>
            {
                Assert.That(inviterFriendship.Status, Is.EqualTo(FriendshipStatus.Pending));
                Assert.That(inviteeFriendship.Status, Is.EqualTo(FriendshipStatus.Pending));
            });
        }
    }

    internal class FriendshipService_Js_Acceptance_Test
    {
        [Test]
        public void Should_Throw_If_Js_Friendship_Is_Inviter()
        {
            var friendshipService = new FriendshipService(new Mock<IIdFactory>().Object, new Mock<IDate>().Object);
            var friendship = new Friendship("inviter", "invitee", FriendshipStatus.Pending, DateTime.UtcNow, true, "id", "otherId");
            var exception = Assert.Throws<JsHackingException>(() => friendshipService.ValidateJsAcceptance(friendship, "inviter"));
            Assert.That(exception.Message, Is.EqualTo("You cannot accept friendship where you are the inviter"));
        }

        [Test]
        public void Should_Throw_If_Js_Friendship_Not_Pending()
        {
            var friendshipService = new FriendshipService(new Mock<IIdFactory>().Object, new Mock<IDate>().Object);
            var friendship = new Friendship("inviter", "invitee", FriendshipStatus.Accepted, DateTime.UtcNow, false, "id", "otherId");
            var exception = Assert.Throws<JsHackingException>(() => friendshipService.ValidateJsAcceptance(friendship, "invitee"));
            Assert.That(exception.Message, Is.EqualTo("You can ony accept a pending friendship"));
        }

        [Test]
        public void Should_Throw_If_Js_Friendship_Does_Not_Agree_With_InvocationContext_UserId()
        {
            var friendshipService = new FriendshipService(new Mock<IIdFactory>().Object, new Mock<IDate>().Object);
            var friendship = new Friendship("inviter", "invitee", FriendshipStatus.Pending, DateTime.UtcNow, false, "id", "otherId");
            var exception = Assert.Throws<JsHackingException>(() => friendshipService.ValidateJsAcceptance(friendship, "invcation context user id"));
            Assert.That(exception.Message, Is.EqualTo("You are not the invitee of the friendship"));
        }

        [Test]
        public void Should_Not_Throw_If_Js_Friendship_Is_Valid()
        {
            var friendshipService = new FriendshipService(new Mock<IIdFactory>().Object, new Mock<IDate>().Object);
            var friendship = new Friendship("invitee", "inviter", FriendshipStatus.Pending, DateTime.UtcNow, false, "id", "otherId");

            friendshipService.ValidateJsAcceptance(friendship, "invitee");
        }



        [Test]
        public void Should_Throw_If_Cosmos_Friendships_Are_Not_Opposite_Sides()
        {
            var friendshipService = new FriendshipService(new Mock<IIdFactory>().Object, new Mock<IDate>().Object);
            var inviterFriendship = new Friendship("inviter", "invitee", FriendshipStatus.Pending, DateTime.UtcNow, true, "id", "otherId");
            var inviteeFriendship = new Friendship("invitee", "inviter", FriendshipStatus.Pending, DateTime.UtcNow, false, "Not a match", "some id");

            var exception = Assert.Throws<JsHackingException>(() => friendshipService.ValidateJsAcceptance(inviterFriendship, inviteeFriendship, ""));
            Assert.That(exception.Message, Is.EqualTo("Invalid id"));
        }

        [Test]
        public void Should_Throw_If_Cosmos_Invitee_Friendship_Is_Inviter()
        {
            var friendshipService = new FriendshipService(new Mock<IIdFactory>().Object, new Mock<IDate>().Object);
            var inviterFriendship = new Friendship("inviter", "invitee", FriendshipStatus.Pending, DateTime.UtcNow, false, "id", "otherId");
            var inviteeFriendship = new Friendship("invitee", "inviter", FriendshipStatus.Pending, DateTime.UtcNow, true, "otherId", "id");

            var exception = Assert.Throws<JsHackingException>(() => friendshipService.ValidateJsAcceptance(inviterFriendship, inviteeFriendship, ""));
            Assert.That(exception.Message, Is.EqualTo("You cannot accept friendship where you are the inviter"));
        }

        [Test]
        public void Should_Throw_If_Cosmos_Invitee_Friendship_Is_Not_Pending()
        {
            var friendshipService = new FriendshipService(new Mock<IIdFactory>().Object, new Mock<IDate>().Object);
            var inviterFriendship = new Friendship("inviter", "invitee", FriendshipStatus.Pending, DateTime.UtcNow, false, "id", "otherId");
            var inviteeFriendship = new Friendship("invitee", "inviter", FriendshipStatus.Accepted, DateTime.UtcNow, false, "otherId", "id");

            var exception = Assert.Throws<JsHackingException>(() => friendshipService.ValidateJsAcceptance(inviterFriendship, inviteeFriendship, ""));
            Assert.That(exception.Message, Is.EqualTo("You can ony accept a pending friendship"));
        }

        [Test]
        public void Should_Throw_If_Cosmos_Invitee_Friendship_Does_Not_Agree_With_InvocationContext_UserId()
        {
            var friendshipService = new FriendshipService(new Mock<IIdFactory>().Object, new Mock<IDate>().Object);
            var inviterFriendship = new Friendship("inviter", "invitee", FriendshipStatus.Pending, DateTime.UtcNow, false, "id", "otherId");
            var inviteeFriendship = new Friendship("invitee", "inviter", FriendshipStatus.Pending, DateTime.UtcNow, false, "otherId", "id");

            var exception = Assert.Throws<JsHackingException>(() => friendshipService.ValidateJsAcceptance(inviterFriendship, inviteeFriendship, ""));
            Assert.That(exception.Message, Is.EqualTo("You are not the invitee of the friendship"));
        }

        [Test]
        public void Should_Not_Throw_If_Cosmos_Friendship_Is_Valid()
        {
            var friendshipService = new FriendshipService(new Mock<IIdFactory>().Object, new Mock<IDate>().Object);
            var inviterFriendship = new Friendship("inviter", "invitee", FriendshipStatus.Pending, DateTime.UtcNow, false, "id", "otherId");
            var inviteeFriendship = new Friendship("invitee", "inviter", FriendshipStatus.Pending, DateTime.UtcNow, false, "otherId", "id");

            friendshipService.ValidateJsAcceptance(inviterFriendship, inviteeFriendship, "invitee");
        }
    }
}
