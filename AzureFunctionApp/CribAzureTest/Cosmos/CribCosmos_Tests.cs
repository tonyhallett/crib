using CribAzureFunctionApp.Cosmos;
using CribAzureFunctionApp.Friendships;
using CribAzureFunctionApp.Matches.State;
using CribAzureTest.Friendships;
using CribAzureTest.TestHelpers;
using Microsoft.Azure.Cosmos;
using Moq;
using System.Collections;

namespace CribAzureTest.Cosmos
{
    internal class CribCosmos_Tests
    {
        public class PlayerFriendshipsCases : IEnumerable
        {
            public IEnumerator GetEnumerator()
            {
                var userId = "SearchId";
                var (userFriendship1, friend1Friendship) = FriendshipCreator.CreateFriendship(userId, "friend1");
                var (userFriendship2, friend2Friendship) = FriendshipCreator.CreateFriendship(userId, "friend2");

                var otherFriendships = FriendshipCreator.CreateFriendship("other1", "other2");

                yield return new TestCaseData(
                    userId,
                    new List<Friendship> { userFriendship1, friend1Friendship, userFriendship2, friend2Friendship, otherFriendships.Item1, otherFriendships.Item2 },
                    // note that container friendships will be ordered by isInviter to fullfill IOrderedQueryable
                    new List<Friendship> { userFriendship1, userFriendship2 }
                );
            }
        }

        [TestCaseSource(typeof(PlayerFriendshipsCases))]
        public async Task GetPlayerFriendshipsAsync_Should_Query_Crib_Database(
            string userId,
            List<Friendship> friendships,
            List<Friendship> expectedFilteredFriendships
        )
        {
            var mockCosmosClient = new Mock<CosmosClient>();

            var mockFriendshipContainer = new Mock<Container>();
            var allFriendshipsOrderedQueryable = friendships.AsQueryable().OrderBy(f => f.IsInviter);
            mockFriendshipContainer.Setup(container => container.GetItemLinqQueryable<Friendship>(false, null, Its.QueryRequestOptionsArePartitioned(new PartitionKey(userId)), null))
                .Returns(allFriendshipsOrderedQueryable);// **
            mockCosmosClient.Setup(cosmosClient => cosmosClient.GetDatabase("Crib").GetContainer("Friendships")).Returns(mockFriendshipContainer.Object);

            var mockFeedIterator = new Mock<IFeedIterator>();
            mockFeedIterator.Setup(feedIterator => feedIterator.GetAllAsync(It.IsAny<IQueryable<Friendship>>()))
                .Callback<IQueryable<Friendship>>(queryableFriendships => // Where filter applied to the container orderedQueryable **
                {
                    // perhaps there is a way of asserting queryableFriendships.Expression;

                    var filteredFriendships = queryableFriendships.ToList();
                    // assert Where is as expected
                    //Assert.That(filteredFriendships,Is.EqualTo(allFriendshipsOrderedQueryable.Where(f => f.inviter == userId || f.invitee == userId)));
                    Assert.That(filteredFriendships, Is.EqualTo(expectedFilteredFriendships));
                })
                .ReturnsAsync(expectedFilteredFriendships);

            var cribCosmos = new CribCosmos(mockFeedIterator.Object);


            var receivedFriendships = await cribCosmos.GetPlayerFriendshipsAsync(mockCosmosClient.Object, userId);

            Assert.That(receivedFriendships, Is.EquivalentTo(expectedFilteredFriendships));

        }

        [Test]
        public async Task GetFriendshipsWithPlayersAsync_Should_Query_Crib_Database()
        {
            var friendships = new List<Friendship>
            {
                new Friendship("player","other",FriendshipStatus.Accepted,DateTime.UtcNow,true,"",""),
                new Friendship("player","p2",FriendshipStatus.Accepted,DateTime.UtcNow,true,"",""),
                new Friendship("player","p3",FriendshipStatus.Accepted,DateTime.UtcNow,true,"","")
            };

            var expectedFilteredFriendships = friendships.GetRange(1, 2);

            var (cosmosClient, mockFriendshipsContainer) = CribMocks.MockContainer("Friendships");
            var allFriendshipsOrderedQueryable = friendships.AsQueryable().OrderBy(f => f.IsInviter);
            mockFriendshipsContainer.Setup(container => container.GetItemLinqQueryable<Friendship>(false, null, Its.QueryRequestOptionsArePartitioned(new PartitionKey("player")), null))
                .Returns(allFriendshipsOrderedQueryable);// **

            var mockFeedIterator = new Mock<IFeedIterator>();
            mockFeedIterator.Setup(feedIterator => feedIterator.GetAllAsync(It.IsAny<IQueryable<Friendship>>()))
                .Callback<IQueryable<Friendship>>(queryableFriendships => // Where filter applied to the container orderedQueryable **
                {
                    var filteredFriendships = queryableFriendships.ToList();
                    Assert.That(filteredFriendships, Is.EqualTo(expectedFilteredFriendships));
                })
                .ReturnsAsync(expectedFilteredFriendships);

            var cribCosmos = new CribCosmos(mockFeedIterator.Object);


            var receivedFriendships = await cribCosmos.GetFriendshipsWithPlayersAsync(cosmosClient, "player", new List<string> { "p2", "p3" });

            Assert.That(receivedFriendships, Is.EquivalentTo(expectedFilteredFriendships));

        }

        [Test]
        public async Task GetPlayerMatchesAsync_Should_Read_The_Player_MatchIds_Then_Read_Each_Match()
        {
            var mockCosmosClient = new Mock<CosmosClient>();
            var mockPlayersContainer = new Mock<Container>();
            var mockMatchesContainer = new Mock<Container>();
            mockCosmosClient.Setup(cosmosClient => cosmosClient.GetDatabase("Crib").GetContainer("Players")).Returns(mockPlayersContainer.Object);
            mockCosmosClient.Setup(cosmosClient => cosmosClient.GetDatabase("Crib").GetContainer("Matches")).Returns(mockMatchesContainer.Object);
            var player = new Player("playerid", new List<string> { "matchid1", "matchid2" });
            mockPlayersContainer.Setup(playersContainer => playersContainer.ReadItemAsync<Player>("playerid", new PartitionKey("playerid"), null, CancellationToken.None))
                .ReturnsAsync(AzureMocks.ItemResponse(player));
            var match1 = new CribMatch(
                Empty.MatchPlayer("playerid"),
                Empty.MatchPlayer("other"),
                null,
                null,
                CribGameState.Discard,
                Cards.AceClubs,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "", "", Empty.ChangeHistory, "", null);
            var match2 = new CribMatch(
                Empty.MatchPlayer("other"),
                Empty.MatchPlayer("playerid"),
                null,
                null,
                CribGameState.Discard,
                Cards.AceClubs,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "", "", Empty.ChangeHistory, "", null);
            mockMatchesContainer.Setup(matchesContainer => matchesContainer.ReadItemAsync<CribMatch>("matchid1", new PartitionKey("matchid1"), null, CancellationToken.None))
                .ReturnsAsync(AzureMocks.ItemResponse(match1));
            mockMatchesContainer.Setup(matchesContainer => matchesContainer.ReadItemAsync<CribMatch>("matchid2", new PartitionKey("matchid2"), null, CancellationToken.None))
                .ReturnsAsync(AzureMocks.ItemResponse(match2));

            var cribCosmos = new CribCosmos(new Mock<IFeedIterator>().Object);


            var matches = await cribCosmos.GetPlayerMatchesAsync(mockCosmosClient.Object, "playerid");

            Assert.That(matches, Is.EqualTo(new List<CribMatch> { match1, match2 }));

        }

        [Test]
        public async Task GetPlayerMatchesAsync_Should_Not_Throw_If_Player_Has_Not_Been_Created()
        {
            var mockCosmosClient = new Mock<CosmosClient>();
            var mockPlayersContainer = new Mock<Container>();
            var mockMatchesContainer = new Mock<Container>();
            mockCosmosClient.Setup(cosmosClient => cosmosClient.GetDatabase("Crib").GetContainer("Players")).Returns(mockPlayersContainer.Object);
            mockPlayersContainer.Setup(playersContainer => playersContainer.ReadItemAsync<Player>("playerid", new PartitionKey("playerid"), null, CancellationToken.None))
                .Throws(new CosmosException("not found", System.Net.HttpStatusCode.NotFound, 0, "", 0));

            var cribCosmos = new CribCosmos(new Mock<IFeedIterator>().Object);

            var matches = await cribCosmos.GetPlayerMatchesAsync(mockCosmosClient.Object, "playerid");

            Assert.That(matches, Is.Empty);

        }

        [Test]
        public async Task GetFriendshipAsync_Should_Retrieve_From_Cosmos()
        {
            var cribCosmos = new CribCosmos(new Mock<IFeedIterator>().Object);
            var (cosmosClient, mockFriendshipsContainer) = CribMocks.MockContainer("Friendships");
            var cosmosFriendship = new Friendship("player", "friend", FriendshipStatus.Pending, DateTime.UtcNow, true, "id", "otherid");
            mockFriendshipsContainer.Setup(friendshipsContainer => friendshipsContainer.ReadItemAsync<Friendship>("id", new PartitionKey("player"), null, CancellationToken.None))
                    .ReturnsAsync(AzureMocks.ItemResponse(cosmosFriendship));

            Friendship friendship = await cribCosmos.GetFriendshipAsync("id", "player", cosmosClient);
            Assert.That(friendship, Is.SameAs(cosmosFriendship));

        }

        [Test]
        public async Task AddFriendshipAsync_Should_Add_To_Cosmos()
        {
            var cribCosmos = new CribCosmos(new Mock<IFeedIterator>().Object);
            var (cosmosClient, mockFriendshipsContainer) = CribMocks.MockContainer("Friendships");
            var inviterFriendship = new Friendship("player", "friend", FriendshipStatus.Pending, DateTime.UtcNow, true, "id", "otherid");
            var inviteeFriendship = new Friendship("friend", "player", FriendshipStatus.Pending, DateTime.UtcNow, false, "otherid", "id");

            await cribCosmos.AddFriendshipAsync(inviterFriendship, inviteeFriendship, cosmosClient);

            mockFriendshipsContainer.Verify(friendshipsContainer => friendshipsContainer.CreateItemAsync(inviterFriendship, new PartitionKey("player"), null, CancellationToken.None));
            mockFriendshipsContainer.Verify(friendshipsContainer => friendshipsContainer.CreateItemAsync(inviteeFriendship, new PartitionKey("friend"), null, CancellationToken.None));
        }

        [Test]
        public async Task ReplaceFriendshipAsync_Should_Replace_In_Cosmos()
        {
            var cribCosmos = new CribCosmos(new Mock<IFeedIterator>().Object);
            var (cosmosClient, mockFriendshipsContainer) = CribMocks.MockContainer("Friendships");
            var inviterFriendship = new Friendship("player", "friend", FriendshipStatus.Pending, DateTime.UtcNow, true, "id", "otherid");
            var inviteeFriendship = new Friendship("friend", "player", FriendshipStatus.Pending, DateTime.UtcNow, false, "otherid", "id");

            await cribCosmos.ReplaceFriendshipAsync(inviterFriendship, inviteeFriendship, cosmosClient);

            mockFriendshipsContainer.Verify(friendshipsContainer => friendshipsContainer.ReplaceItemAsync(inviterFriendship, "id", new PartitionKey("player"), null, CancellationToken.None));
            mockFriendshipsContainer.Verify(friendshipsContainer => friendshipsContainer.ReplaceItemAsync(inviteeFriendship, "otherid", new PartitionKey("friend"), null, CancellationToken.None));
        }

        [Test]
        public async Task CreateMatchAsync_Should_Create_Match_In_Matches_Container()
        {
            var cribCosmos = new CribCosmos(new Mock<IFeedIterator>().Object);
            var (cosmosClient, mockContainers) = CribMocks.MockContainers("Matches", "Players");
            var mockPlayersContainer = mockContainers[1];
            mockPlayersContainer.Setup(playersContainer => playersContainer.ReadItemAsync<Player>(It.IsAny<string>(), It.IsAny<PartitionKey>(), null, CancellationToken.None))
                    .ReturnsAsync(AzureMocks.ItemResponse(new Player("", new List<string>())));

            var match = new CribMatch(
                Empty.MatchPlayer("playerid"),
                Empty.MatchPlayer("other"),
                null,
                null,
                CribGameState.Discard,
                Cards.AceClubs,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "",
                "matchid", Empty.ChangeHistory, "", null);

            await cribCosmos.CreateMatchAsync(cosmosClient, match);

            mockContainers[0].Verify(matchesContainer => matchesContainer.CreateItemAsync(match, new PartitionKey("matchid"), null, CancellationToken.None));
        }

        [Test]
        public async Task CreateMatchAsync_Should_Add_MatchId_To_Player_With_Replace_When_Player_Exists()
        {
            var cribCosmos = new CribCosmos(new Mock<IFeedIterator>().Object);
            var (cosmosClient, mockContainers) = CribMocks.MockContainers("Matches", "Players");
            var mockPlayersContainer = mockContainers[1];
            var player1 = new Player("playerid", new List<string> { "pmatch1" });
            var player2 = new Player("otherid", new List<string> { "omatch1" });
            mockPlayersContainer.Setup(playersContainer => playersContainer.ReadItemAsync<Player>("playerid", new PartitionKey("playerid"), null, CancellationToken.None))
                    .ReturnsAsync(AzureMocks.ItemResponse(player1));
            mockPlayersContainer.Setup(playersContainer => playersContainer.ReadItemAsync<Player>("otherid", new PartitionKey("otherid"), null, CancellationToken.None))
                    .ReturnsAsync(AzureMocks.ItemResponse(player2));


            var match = new CribMatch(
                Empty.MatchPlayer("playerid"),
                Empty.MatchPlayer("otherid"),
                null,
                null,
                CribGameState.Discard,
                Cards.AceClubs,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "",
                "matchid", Empty.ChangeHistory, "", null);

            await cribCosmos.CreateMatchAsync(cosmosClient, match);

            mockPlayersContainer.Verify(playersContainer => playersContainer.ReplaceItemAsync(player1, "playerid", new PartitionKey("playerid"), null, CancellationToken.None));
            mockPlayersContainer.Verify(playersContainer => playersContainer.ReplaceItemAsync(player2, "otherid", new PartitionKey("otherid"), null, CancellationToken.None));

            Assert.Multiple(() =>
            {
                Assert.That(player1.matchIds, Is.EqualTo(new List<string> { "pmatch1", "matchid" }));
                Assert.That(player2.matchIds, Is.EqualTo(new List<string> { "omatch1", "matchid" }));
            });
        }

        [Test]
        public async Task CreateMatchAsync_Should_Create_Player_With_MatchId_If_Player_Does_Not_Exist_In_Cosmos()
        {
            var cribCosmos = new CribCosmos(new Mock<IFeedIterator>().Object);
            var (cosmosClient, mockContainers) = CribMocks.MockContainers("Matches", "Players");
            var mockPlayersContainer = mockContainers[1];
            var player1 = new Player("playerid", new List<string> { "pmatch1" });
            mockPlayersContainer.Setup(playersContainer => playersContainer.ReadItemAsync<Player>("playerid", new PartitionKey("playerid"), null, CancellationToken.None))
                    .ReturnsAsync(AzureMocks.ItemResponse(player1));
            mockPlayersContainer.Setup(playersContainer => playersContainer.ReadItemAsync<Player>("otherid", new PartitionKey("otherid"), null, CancellationToken.None))
                    .Throws(new CosmosException("", System.Net.HttpStatusCode.NotFound, 0, "", 0));


            var match = new CribMatch(
                Empty.MatchPlayer("playerid"),
                Empty.MatchPlayer("otherid"),
                null,
                null,
                CribGameState.Discard,
                Cards.AceClubs,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "",
                "matchid", Empty.ChangeHistory, "", null);

            await cribCosmos.CreateMatchAsync(cosmosClient, match);

            // todo - override equals on Player
            var invocationArguments = mockPlayersContainer.Invocations.Single(invocation => invocation.Method.Name == nameof(Container.CreateItemAsync)).Arguments;
            var createdPlayer = invocationArguments[0] as Player;
            Assert.Multiple(() =>
            {
                Assert.That(createdPlayer!.id, Is.EqualTo("otherid"));
                Assert.That(createdPlayer!.matchIds, Is.EqualTo(new List<string> { "matchid" }));
                Assert.That(invocationArguments[1], Is.EqualTo(new PartitionKey("otherid")));
                Assert.That(invocationArguments[2], Is.Null);
                Assert.That(invocationArguments[3], Is.EqualTo(CancellationToken.None));
            });
        }

        [Test]
        public async Task ReadMatchAsync_Should_Read_From_Cosmos()
        {
            var match = new CribMatch(
                Empty.MatchPlayer("playerid"),
                Empty.MatchPlayer("otherid"),
                null,
                null,
                CribGameState.Discard,
                Cards.AceClubs,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "",
                "matchid", Empty.ChangeHistory, "", null);

            var cribCosmos = new CribCosmos(new Mock<IFeedIterator>().Object);
            var (cosmosClient, mockMatchesContainer) = CribMocks.MockContainer("Matches");
            mockMatchesContainer.Setup(matchesContainer => matchesContainer.ReadItemAsync<CribMatch>("matchid", new PartitionKey("matchid"), null, CancellationToken.None))
                .ReturnsAsync(AzureMocks.ItemResponse(match));


            var cosmosMatch = await cribCosmos.ReadMatchAsync(cosmosClient, "matchid");

            Assert.That(cosmosMatch, Is.SameAs(match));
        }

        [Test]
        public async Task ReplaceMatchAsync_Should_Replace_In_Cosmos()
        {
            var match = new CribMatch(
                Empty.MatchPlayer("playerid"),
                Empty.MatchPlayer("otherid"),
                null,
                null,
                CribGameState.Discard,
                Cards.AceClubs,
                Empty.Cards,
                Empty.DealerDetails,
                Empty.Pegging,
                Empty.Scores,
                "",
                "matchid", Empty.ChangeHistory, "", null);

            var cribCosmos = new CribCosmos(new Mock<IFeedIterator>().Object);
            var (cosmosClient, mockMatchesContainer) = CribMocks.MockContainer("Matches");



            await cribCosmos.ReplaceMatchAsync(cosmosClient, match);

            mockMatchesContainer.Verify(matchesContainer => matchesContainer.ReplaceItemAsync(match, "matchid", new PartitionKey("matchid"), null, CancellationToken.None));


        }
    }
}
