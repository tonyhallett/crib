using CribAzureFunctionApp.Cosmos;
using CribAzureFunctionApp.Friendships;
using CribAzureFunctionApp.Hub;
using CribAzureFunctionApp.Matches.Change;
using CribAzureFunctionApp.Matches.Creation;
using CribAzureFunctionApp.Matches.MyMatches;
using CribAzureFunctionApp.Matches.State;
using CribAzureFunctionApp.Verification;
using CribAzureTest.Friendships;
using CribAzureTest.TestHelpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.SignalR.Management;
using Microsoft.Azure.WebJobs.Extensions.SignalRService;
using Moq;
using System.Collections;

namespace CribAzureTest.Hub
{
    internal class CribHub_Tests
    {
        private const string invocationUserId = "playerId";
        private readonly CosmosClient cosmosClient = new Mock<CosmosClient>().Object;
        private readonly InvocationContext invocationContext = new() { UserId = invocationUserId };
        private readonly CribMatch match = new(
            Empty.MatchPlayer(""),
            Empty.MatchPlayer(""),
            null,
            null,
            CribGameState.Pegging,
            Cards.AceDiamonds,
            Empty.Cards,
            Empty.DealerDetails,
            Empty.Pegging,
            Empty.Scores,
            "3", "id", Empty.ChangeHistory, "", null);

        [Test]
        public async Task Should_NegotiateAsync_Using_The_Authorization_Headers_From_The_Trigger()
        {
            var authorization = "authorization";

            var negotationResponse = new NegotiationResponse { Url = "url", AccessToken = "access token" };

            var negotiationOptions = new NegotiationOptions();


            var mockServiceHubContext = new Mock<ServiceHubContext<CribClient>>();
            mockServiceHubContext.Setup(shc => shc.NegotiateAsync(negotiationOptions, It.IsAny<CancellationToken>()))
                .ReturnsAsync(negotationResponse);

            var mockNegotiator = new Mock<INegotiator>();

            mockNegotiator.Setup(negotiator => negotiator.Negotitate(authorization)).Returns(negotiationOptions);

            var cribHub = new CribHub(
                mockNegotiator.Object,
                new Mock<ICribCosmos>().Object,
                new Mock<IMatchFactory>().Object,
                new Mock<IMyMatchFactory>().Object,
                new Mock<IMatchLogic>().Object,
                new Mock<IFriendshipService>().Object,
                mockServiceHubContext.Object);

            var mockHttpRequest = new Mock<HttpRequest>();
            mockHttpRequest.SetupGet(r => r.Headers.Authorization).Returns(new Microsoft.Extensions.Primitives.StringValues(authorization));

            var signalRConnectionInfo = await cribHub.NegotiateAsync(mockHttpRequest.Object);

            Assert.Multiple(() =>
            {
                Assert.That(signalRConnectionInfo.Url, Is.EqualTo("url"));
                Assert.That(signalRConnectionInfo.AccessToken, Is.EqualTo("access token"));
            });
        }

        [Test]
        public async Task InitialPlayerData_Should_Read_Crib_Database_And_Notify_The_Client(
        )
        {
            var (serviceHubContext, mockCribClient) = AzureMocks.ServiceHubContextUser<CribClient>(invocationUserId);

            var mockCribCosmos = new Mock<ICribCosmos>();

            var friendships = new List<Friendship> { new Friendship("", "", FriendshipStatus.Accepted, DateTime.UtcNow, true, "", "") };

            var myMatch = new MyMatch("", "", CribGameState.Show, "", Empty.DealerDetails, Empty.ChangeHistory, null, Empty.MyPegging, Empty.Scores, Cards.AceClubs, null, new List<OtherPlayer>(), Empty.Cards, Empty.HandAndBoxScoringHistory, false, "");
            var matches = new List<CribMatch> { match };
            mockCribCosmos.Setup(cribCosmos => cribCosmos.GetPlayerMatchesAsync(cosmosClient, invocationUserId))
                .ReturnsAsync(matches);
            mockCribCosmos.Setup(cribCosmos => cribCosmos.GetPlayerFriendshipsAsync(cosmosClient, invocationUserId))
                .ReturnsAsync(friendships);

            var mockMyMatchFactory = new Mock<IMyMatchFactory>();
            mockMyMatchFactory.Setup(matchLogic => matchLogic.ToMyMatch(match, invocationUserId)).Returns(myMatch);
            var cribHub = new CribHub(
                new Mock<INegotiator>().Object,
                mockCribCosmos.Object,
                new Mock<IMatchFactory>().Object,
                mockMyMatchFactory.Object,
                new Mock<IMatchLogic>().Object,
                new Mock<IFriendshipService>().Object,
                serviceHubContext);

            await cribHub.InitialPlayerData(invocationContext, cosmosClient);


            mockCribClient.Verify(cribClient => cribClient.initialPlayerData(friendships, new List<MyMatch> { myMatch }));

        }

        public class CreateMatchPlayersCases : IEnumerable
        {
            public IEnumerator GetEnumerator()
            {
                yield return new TestCaseData(
                   new List<string>(),
                    "CreateMatch options must have at least one other player"
                    ).SetName("CreateMatch_Should_Throw_If_MatchOptions_No_Other_Players");

                yield return new TestCaseData(
                  new List<string> { "first", "second", "third", "toomany" },
                   "CreateMatch options cannot have more than 3 other players"
                   ).SetName("CreateMatch_Should_Throw_If_MatchOptions_Too_Many_Players");

                yield return new TestCaseData(
                  new List<string> { "first", invocationUserId },
                   "CreateMatch options - cannot play against yourself"
                   ).SetName("CreateMatch_Should_Throw_If_MatchOptions_Play_With_Self");

                yield return new TestCaseData(
                  new List<string> { "ok" },
                   null
                   ).SetName("CreateMatch_Should_Not_Throw_With_Correct_Players");

            }
        }


        [TestCaseSource(typeof(CreateMatchPlayersCases))]
        public async Task CreateMatch_Should_Throw_If_MatchOptions_Incorrect_Players(List<string> otherPlayers, string? expectedExceptionMessage)
        {
            var matchOptions = new MatchOptions(otherPlayers, "3", "");

            var mockCribCosmos = new Mock<ICribCosmos>();
            var friendships = Enumerable.Repeat(new Friendship("", "", FriendshipStatus.Accepted, DateTime.Now, true, "", ""), otherPlayers.Count).ToList();
            mockCribCosmos.Setup(cribCosmos => cribCosmos.GetFriendshipsWithPlayersAsync(It.IsAny<CosmosClient>(), It.IsAny<string>(), It.IsAny<List<string>>())).ReturnsAsync(friendships);
            var mockMatchFactory = new Mock<IMatchFactory>();

            mockMatchFactory.Setup(matchFactory => matchFactory.Create(matchOptions, It.IsAny<string>())).Returns(match);

            var cribHub = new CribHub(
                new Mock<INegotiator>().Object,
                mockCribCosmos.Object,
                mockMatchFactory.Object,
                new Mock<IMyMatchFactory>().Object,
                new Mock<IMatchLogic>().Object,
                new Mock<IFriendshipService>().Object,
                AzureMocks.ServiceHubContextAnyUser<CribClient>());

            Task CreateMatch()
            {
                return cribHub.CreateMatch(invocationContext, cosmosClient, matchOptions);
            }

            if (expectedExceptionMessage != null)
            {
                var exception = Assert.ThrowsAsync<ArgumentException>(CreateMatch);
                Assert.That(exception.Message, Is.EqualTo(expectedExceptionMessage));
            }
            else
            {
                await CreateMatch();

            }
        }

        [Test]
        public async Task CreateMatch_Should_CreateMatch_In_Cosmos_With_New_Match_From_Options()
        {
            var matchOptions = new MatchOptions(new List<string> { "p2", "p3", "p4" }, "3", "");

            var mockCribCosmos = new Mock<ICribCosmos>();

            var mockMatchFactory = new Mock<IMatchFactory>();
            mockMatchFactory.Setup(matchFactory => matchFactory.Create(matchOptions, invocationUserId)).Returns(match);

            mockCribCosmos.Setup(cribCosmos => cribCosmos.GetFriendshipsWithPlayersAsync(cosmosClient, It.IsAny<string>(), It.IsAny<List<string>>()))
                .ReturnsAsync(new List<Friendship> {
                    new Friendship("","",FriendshipStatus.Accepted,DateTime.Now, true,"",""),
                    new Friendship("","",FriendshipStatus.Accepted,DateTime.Now, true,"",""),
                    new Friendship("","",FriendshipStatus.Accepted,DateTime.Now, true,"","")
                });
            var cribHub = new CribHub(
                new Mock<INegotiator>().Object,
                mockCribCosmos.Object,
                mockMatchFactory.Object,
                new Mock<IMyMatchFactory>().Object,
                new Mock<IMatchLogic>().Object,
                new Mock<IFriendshipService>().Object,
                AzureMocks.ServiceHubContextAnyUser<CribClient>());

            await cribHub.CreateMatch(invocationContext, cosmosClient, matchOptions);

            mockCribCosmos.Verify(cribCosmos => cribCosmos.CreateMatchAsync(cosmosClient, match));
        }

        [Test]
        public async Task CreateMatch_Should_SignalR_Match_Created_With_Each_Player_View_Of_The_Match()
        {
            var otherPlayers = new List<string> { "p2", "p3", "p4" };
            var matchOptions = new MatchOptions(otherPlayers, "3", "");

            var mockCribCosmos = new Mock<ICribCosmos>();


            var matchViews = new List<MyMatch> {
                new MyMatch("", "",CribGameState.Show,"", Empty.DealerDetails,Empty.ChangeHistory, null, Empty.MyPegging, Empty.Scores,Cards.AceClubs,null,new List<OtherPlayer>(), Empty.Cards,Empty.HandAndBoxScoringHistory, false, ""),
                new MyMatch("", "", CribGameState.Pegging, "", Empty.DealerDetails, Empty.ChangeHistory, null, Empty.MyPegging, Empty.Scores,Cards.AceClubs,null, new List<OtherPlayer>(), Empty.Cards,Empty.HandAndBoxScoringHistory, false, ""),
                new MyMatch("", "", CribGameState.Discard, "", Empty.DealerDetails, Empty.ChangeHistory, null, Empty.MyPegging, Empty.Scores,Cards.AceClubs,null, new List<OtherPlayer >(), Empty.Cards,Empty.HandAndBoxScoringHistory, false, ""),
                new MyMatch("", "", CribGameState.Pegging, "", Empty.DealerDetails, Empty.ChangeHistory, null, Empty.MyPegging, Empty.Scores,Cards.AceClubs,null, new List<OtherPlayer>(), Empty.Cards,Empty.HandAndBoxScoringHistory, false, "")
            };
            var mockMyMatchFactory = new Mock<IMyMatchFactory>();
            mockMyMatchFactory.Setup(matchLogic => matchLogic.ToMyMatch(match, invocationUserId)).Returns(matchViews[0]);
            for (var i = 0; i < otherPlayers.Count; i++)
            {
                mockMyMatchFactory.Setup(matchLogic => matchLogic.ToMyMatch(match, otherPlayers[i])).Returns(matchViews[i + 1]);
            }


            var mockMatchFactory = new Mock<IMatchFactory>();
            mockMatchFactory.Setup(matchFactory => matchFactory.Create(matchOptions, invocationUserId)).Returns(match);

            mockCribCosmos.Setup(cribCosmos => cribCosmos.GetFriendshipsWithPlayersAsync(cosmosClient, It.IsAny<string>(), It.IsAny<List<string>>()))
                .ReturnsAsync(new List<Friendship> {
                    new Friendship("","",FriendshipStatus.Accepted,DateTime.Now, true,"",""),
                    new Friendship("","",FriendshipStatus.Accepted,DateTime.Now, true,"",""),
                    new Friendship("","",FriendshipStatus.Accepted,DateTime.Now, true,"","")
                });

            var (serviceHubContext, mockClients) = AzureMocks.ServiceHubContextAllUsers<CribClient>(new List<string> { invocationUserId, "p2", "p3", "p4" });

            var cribHub = new CribHub(
                new Mock<INegotiator>().Object,
                mockCribCosmos.Object,
                mockMatchFactory.Object,
                mockMyMatchFactory.Object,
                new Mock<IMatchLogic>().Object,
                new Mock<IFriendshipService>().Object,
                serviceHubContext);

            await cribHub.CreateMatch(invocationContext, cosmosClient, matchOptions);

            for (var i = 0; i < mockClients.Count; i++)
            {
                var playerMatch = mockClients[i].Invocations.Single(invocation => invocation.Method.Name == nameof(CribClient.matchCreated)).Arguments[0];
                Assert.That(playerMatch, Is.SameAs(matchViews[i]));
            }

        }

        [TestCase(FriendshipStatus.Pending)]
        [TestCase(FriendshipStatus.Rejected)]
        public void CreateMatch_Should_Throw_If_Any_Friendships_Have_Not_Been_Accepted(FriendshipStatus friendshipStatus)
        {
            var matchOptions = new MatchOptions(new List<string> { "p2", "p3", "p4" }, "3", "");

            var mockCribCosmos = new Mock<ICribCosmos>();

            var friendships = new List<Friendship>
            {
                new Friendship("","",FriendshipStatus.Accepted, DateTime.Now,true,"",""),
                new Friendship("", "", FriendshipStatus.Accepted, DateTime.Now, true, "", ""),
                new Friendship("", "", friendshipStatus, DateTime.Now, true, "", "")
            };
            mockCribCosmos.Setup(cribCosmos => cribCosmos.GetFriendshipsWithPlayersAsync(cosmosClient, invocationUserId, It.IsAny<List<string>>())).ReturnsAsync(friendships);

            var (serviceHubContext, mockClients) = AzureMocks.ServiceHubContextAllUsers<CribClient>(new List<string> { invocationUserId, "p2", "p3", "p4" });

            var cribHub = new CribHub(
                new Mock<INegotiator>().Object,
                mockCribCosmos.Object,
                new Mock<IMatchFactory>().Object,
                new Mock<IMyMatchFactory>().Object,
                new Mock<IMatchLogic>().Object,
                new Mock<IFriendshipService>().Object,
                serviceHubContext);

            var exception = Assert.ThrowsAsync<JsHackingException>(async () => await cribHub.CreateMatch(invocationContext, cosmosClient, matchOptions));
            Assert.That(exception.Message, Is.EqualTo("Not all players have accepted your friendship"));
        }

        [Test]
        public void CreateMatch_Should_Throw_If_Insufficient_Friendships()
        {
            var matchOptions = new MatchOptions(new List<string> { "p2", "p3", "p4" }, "3", "");

            var mockCribCosmos = new Mock<ICribCosmos>();

            var friendships = new List<Friendship>
            {
                new Friendship("","",FriendshipStatus.Accepted, DateTime.Now,true,"",""),
                new Friendship("", "", FriendshipStatus.Accepted, DateTime.Now, true, "", ""),
            };
            mockCribCosmos.Setup(cribCosmos => cribCosmos.GetFriendshipsWithPlayersAsync(cosmosClient, invocationUserId, It.IsAny<List<string>>())).ReturnsAsync(friendships);

            var (serviceHubContext, mockClients) = AzureMocks.ServiceHubContextAllUsers<CribClient>(new List<string> { invocationUserId, "p2", "p3", "p4" });

            var cribHub = new CribHub(
                new Mock<INegotiator>().Object,
                mockCribCosmos.Object,
                new Mock<IMatchFactory>().Object,
                new Mock<IMyMatchFactory>().Object,
                new Mock<IMatchLogic>().Object,
                new Mock<IFriendshipService>().Object,
                serviceHubContext);

            var exception = Assert.ThrowsAsync<JsHackingException>(async () => await cribHub.CreateMatch(invocationContext, cosmosClient, matchOptions));
            Assert.That(exception.Message, Is.EqualTo("You are not friends with all of the match players"));
        }

        [Test]
        public async Task Discard_Should_Get_The_Match_From_Cosmos()
        {
            var mockCribCosmos = new Mock<ICribCosmos>();
            mockCribCosmos.Setup(cribCosmos => cribCosmos.ReadMatchAsync(cosmosClient, "123")).ReturnsAsync(match);
            var cribHub = new CribHub(
                new Mock<INegotiator>().Object,
                mockCribCosmos.Object,
                new Mock<IMatchFactory>().Object,
                new Mock<IMyMatchFactory>().Object,
                new Mock<IMatchLogic>().Object,
                new Mock<IFriendshipService>().Object,
                AzureMocks.ServiceHubContextAnyUser<CribClient>());

            await cribHub.Discard(invocationContext, cosmosClient, "123", Cards.AceDiamonds, null);

            mockCribCosmos.VerifyAll();
        }

        [Test]
        public async Task Discard_Should_Apply_Discard_Logic_And_Replace_Match()
        {
            var mockCribCosmos = new Mock<ICribCosmos>();
            mockCribCosmos.Setup(cribCosmos => cribCosmos.ReadMatchAsync(cosmosClient, "123")).ReturnsAsync(match);
            DateTime? replaceMatchTime = null;
            mockCribCosmos.Setup(cribCosmos => cribCosmos.ReplaceMatchAsync(cosmosClient, match)).Callback(() =>
            {
                replaceMatchTime = DateTime.Now;
            });
            var mockMatchLogic = new Mock<IMatchLogic>();
            var discard1 = Cards.AceDiamonds;
            var discard2 = Cards.AceHearts;

            DateTime? discardTime = null;
            mockMatchLogic.Setup(matchLogic => matchLogic.Discard(match, invocationUserId, discard1, discard2)).Callback(() =>
            {
                discardTime = DateTime.Now;
            });

            var cribHub = new CribHub(
                new Mock<INegotiator>().Object,
                mockCribCosmos.Object,
                new Mock<IMatchFactory>().Object,
                new Mock<IMyMatchFactory>().Object,
                mockMatchLogic.Object,
                new Mock<IFriendshipService>().Object,
                AzureMocks.ServiceHubContextAnyUser<CribClient>()
            );

            await cribHub.Discard(invocationContext, cosmosClient, "123", discard1, discard2);

            mockMatchLogic.VerifyAll();
            mockCribCosmos.VerifyAll();

            Assert.That(replaceMatchTime, Is.GreaterThan(discardTime));
        }

        [Test]
        public async Task SendFriendRequests_Should_Add_Friendships_To_Cosmos()
        {
            var mockCribCosmos = new Mock<ICribCosmos>();
            var mockFriendshipService = new Mock<IFriendshipService>();
            var friend1Friendship = FriendshipCreator.CreateFriendship(invocationUserId, "friend1");
            var friend2Friendship = FriendshipCreator.CreateFriendship(invocationUserId, "friend2");
            mockFriendshipService.Setup(friendshipService => friendshipService.CreateFriendship(invocationUserId, "friend1"))
                .Returns(friend1Friendship);
            mockFriendshipService.Setup(friendshipService => friendshipService.CreateFriendship(invocationUserId, "friend2"))
                .Returns(friend2Friendship);

            var cribHub = new CribHub(
                new Mock<INegotiator>().Object,
                mockCribCosmos.Object,
                new Mock<IMatchFactory>().Object,
                new Mock<IMyMatchFactory>().Object,
                new Mock<IMatchLogic>().Object,
                mockFriendshipService.Object,
                AzureMocks.ServiceHubContextAnyUser<CribClient>()
            );

            await cribHub.SendFriendRequests(invocationContext, cosmosClient, new List<string> { "friend1", "friend2" });

            mockCribCosmos.Verify(cribCosmos => cribCosmos.AddFriendshipAsync(friend1Friendship.Item1, friend1Friendship.Item2, cosmosClient));
            mockCribCosmos.Verify(cribCosmos => cribCosmos.AddFriendshipAsync(friend2Friendship.Item1, friend2Friendship.Item2, cosmosClient));
        }

        [Test]
        public async Task SendFriendRequests_Should_SignalR_FriendRequest_For_Invitees()
        {
            var mockCribCosmos = new Mock<ICribCosmos>();
            var mockFriendshipService = new Mock<IFriendshipService>();
            var friend1Friendship = FriendshipCreator.CreateFriendship(invocationUserId, "friend1");
            var friend2Friendship = FriendshipCreator.CreateFriendship(invocationUserId, "friend2");
            mockFriendshipService.Setup(friendshipService => friendshipService.CreateFriendship(invocationUserId, "friend1"))
                .Returns(friend1Friendship);
            mockFriendshipService.Setup(friendshipService => friendshipService.CreateFriendship(invocationUserId, "friend2"))
                .Returns(friend2Friendship);

            var (serviceHubContext, mockClients) = AzureMocks.ServiceHubContextAllUsers<CribClient>(new List<string> { "friend1", "friend2", invocationUserId });

            var cribHub = new CribHub(
                new Mock<INegotiator>().Object,
                mockCribCosmos.Object,
                new Mock<IMatchFactory>().Object,
                new Mock<IMyMatchFactory>().Object,
                new Mock<IMatchLogic>().Object,
                mockFriendshipService.Object,
                serviceHubContext
            );

            await cribHub.SendFriendRequests(invocationContext, cosmosClient, new List<string> { "friend1", "friend2" });

            mockClients[0].Verify(friend1Client => friend1Client.friendRequest(friend1Friendship.Item2));
            mockClients[1].Verify(friend2Client => friend2Client.friendRequest(friend2Friendship.Item2));
        }

        [Test]
        public async Task SendFriendRequests_Should_SignalR_SentFriendRequest_To_Inviter()
        {
            var mockCribCosmos = new Mock<ICribCosmos>();
            var mockFriendshipService = new Mock<IFriendshipService>();
            var friend1Friendship = FriendshipCreator.CreateFriendship(invocationUserId, "friend1");
            var friend2Friendship = FriendshipCreator.CreateFriendship(invocationUserId, "friend2");
            mockFriendshipService.Setup(friendshipService => friendshipService.CreateFriendship(invocationUserId, "friend1"))
                .Returns(friend1Friendship);
            mockFriendshipService.Setup(friendshipService => friendshipService.CreateFriendship(invocationUserId, "friend2"))
                .Returns(friend2Friendship);

            var (serviceHubContext, mockClients) = AzureMocks.ServiceHubContextAllUsers<CribClient>(new List<string> { "friend1", "friend2", invocationUserId });

            var cribHub = new CribHub(
                new Mock<INegotiator>().Object,
                mockCribCosmos.Object,
                new Mock<IMatchFactory>().Object,
                new Mock<IMyMatchFactory>().Object,
                new Mock<IMatchLogic>().Object,
                mockFriendshipService.Object,
                serviceHubContext
            );

            await cribHub.SendFriendRequests(invocationContext, cosmosClient, new List<string> { "friend1", "friend2" });

            mockClients[2].Verify(friend1Client => friend1Client.sentFriendRequests(new List<Friendship> { friend1Friendship.Item1, friend2Friendship.Item1 }));
        }

        [Test]
        public async Task AcceptFriendRequest_Should_Validate_Js_Friendship()
        {
            var mockCribCosmos = new Mock<ICribCosmos>();
            mockCribCosmos.Setup(cribCosmos => cribCosmos.GetFriendshipAsync(It.IsAny<string>(), It.IsAny<string>(), cosmosClient))
                .ReturnsAsync(new Friendship("", "", FriendshipStatus.Pending, DateTime.Now, false, "", ""));
            var mockFriendshipService = new Mock<IFriendshipService>();

            var cribHub = new CribHub(
                new Mock<INegotiator>().Object,
                mockCribCosmos.Object,
                new Mock<IMatchFactory>().Object,
                new Mock<IMyMatchFactory>().Object,
                new Mock<IMatchLogic>().Object,
                mockFriendshipService.Object,
                AzureMocks.ServiceHubContextAnyUser<CribClient>()
            );

            var fromJsFriendship = new Friendship("player", "friend", FriendshipStatus.Pending, DateTime.Now, false, "id", "otherid");

            await cribHub.AcceptFriendRequest(invocationContext, cosmosClient, fromJsFriendship);

            mockFriendshipService.Verify(friendshipService => friendshipService.ValidateJsAcceptance(fromJsFriendship, invocationUserId));

        }

        [Test]
        public async Task AcceptFriendRequest_Should_Retrieve_The_Friendship_From_Cosmos()
        {
            var mockCribCosmos = new Mock<ICribCosmos>();
            mockCribCosmos.Setup(cribCosmos => cribCosmos.GetFriendshipAsync("id", "player", cosmosClient))
                .ReturnsAsync(new Friendship("", "", FriendshipStatus.Pending, DateTime.Now, false, "", ""));
            mockCribCosmos.Setup(cribCosmos => cribCosmos.GetFriendshipAsync("otherid", "friend", cosmosClient))
                .ReturnsAsync(new Friendship("", "", FriendshipStatus.Pending, DateTime.Now, false, "", ""));

            var cribHub = new CribHub(
                new Mock<INegotiator>().Object,
                mockCribCosmos.Object,
                new Mock<IMatchFactory>().Object,
                new Mock<IMyMatchFactory>().Object,
                new Mock<IMatchLogic>().Object,
                new Mock<IFriendshipService>().Object,
                AzureMocks.ServiceHubContextAnyUser<CribClient>()
            );

            var fromJsFriendship = new Friendship("player", "friend", FriendshipStatus.Pending, DateTime.Now, false, "id", "otherid");

            await cribHub.AcceptFriendRequest(invocationContext, cosmosClient, fromJsFriendship);

            mockCribCosmos.VerifyAll();
        }

        [Test]
        public async Task AcceptFriendRequest_Should_Verify_The_Friendship_From_Cosmos()
        {
            var mockCribCosmos = new Mock<ICribCosmos>();

            var inviteeFriendship = new Friendship("p1", "p2", FriendshipStatus.Pending, DateTime.Now, false, "1", "2");
            var inviterFriendship = new Friendship("p2", "p1", FriendshipStatus.Pending, DateTime.Now, true, "2", "1");
            mockCribCosmos.Setup(cribCosmos => cribCosmos.GetFriendshipAsync("id", "player", cosmosClient))
                .ReturnsAsync(inviteeFriendship);
            mockCribCosmos.Setup(cribCosmos => cribCosmos.GetFriendshipAsync("otherid", "friend", cosmosClient))
                .ReturnsAsync(inviterFriendship);
            var mockFriendshipService = new Mock<IFriendshipService>();

            var cribHub = new CribHub(
                new Mock<INegotiator>().Object,
                mockCribCosmos.Object,
                new Mock<IMatchFactory>().Object,
                new Mock<IMyMatchFactory>().Object,
                new Mock<IMatchLogic>().Object,
                mockFriendshipService.Object,
                AzureMocks.ServiceHubContextAnyUser<CribClient>()
            );

            var fromJsFriendship = new Friendship("player", "friend", FriendshipStatus.Pending, DateTime.Now, false, "id", "otherid");

            await cribHub.AcceptFriendRequest(invocationContext, cosmosClient, fromJsFriendship);

            mockFriendshipService.Verify(friendshipService => friendshipService.ValidateJsAcceptance(inviterFriendship, inviteeFriendship, invocationUserId));
        }

        [Test]
        public async Task AcceptFriendRequest_Should_Update_Cosmos_With_Friendship_In_Accepted_State()
        {

            var mockCribCosmos = new Mock<ICribCosmos>();

            var inviteeFriendship = new Friendship("p1", "p2", FriendshipStatus.Pending, DateTime.Now, false, "1", "2");
            var inviterFriendship = new Friendship("p2", "p1", FriendshipStatus.Pending, DateTime.Now, true, "2", "1");
            mockCribCosmos.Setup(cribCosmos => cribCosmos.GetFriendshipAsync("id", "player", cosmosClient))
                .ReturnsAsync(inviteeFriendship);
            mockCribCosmos.Setup(cribCosmos => cribCosmos.GetFriendshipAsync("otherid", "friend", cosmosClient))
                .ReturnsAsync(inviterFriendship);
            var mockFriendshipService = new Mock<IFriendshipService>();

            var cribHub = new CribHub(
                new Mock<INegotiator>().Object,
                mockCribCosmos.Object,
                new Mock<IMatchFactory>().Object,
                new Mock<IMyMatchFactory>().Object,
                new Mock<IMatchLogic>().Object,
                mockFriendshipService.Object,
                AzureMocks.ServiceHubContextAnyUser<CribClient>()
            );

            var fromJsFriendship = new Friendship("player", "friend", FriendshipStatus.Pending, DateTime.Now, false, "id", "otherid");

            await cribHub.AcceptFriendRequest(invocationContext, cosmosClient, fromJsFriendship);

            var acceptedInviterFriendship = inviterFriendship with { Status = FriendshipStatus.Accepted };
            var acceptedInviteeFriendship = inviteeFriendship with { Status = FriendshipStatus.Accepted };

            mockCribCosmos.Verify(cribCosmos => cribCosmos.ReplaceFriendshipAsync(
                acceptedInviterFriendship,
                acceptedInviteeFriendship,
                cosmosClient
                )
            );
        }
    }

}
