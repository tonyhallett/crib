// See https://aka.ms/new-console-template for more information
using CribAzureFunctionApp.Cosmos;
using CribAzureFunctionApp.Friendships;
using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.Creation;
using CribAzureFunctionApp.Matches.Deal;
using CribAzureFunctionApp.Matches.Utilities;
using CribAzureFunctionApp.Utilities;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Linq;


var myId = "tonyhallett74@gmail.com";
var otherId1 = "p1";
var otherId2 = "p2";
var otherId3 = "p3";

var cribCosmos = new CribCosmos(new CribAzureFunctionApp.Cosmos.FeedIterator());
var friendshipService = new FriendshipService(new IdFactory(), new Date());
var matchFactory = new MatchFactory(
    new CribDealer(
        new CribPlayingCardsProvider<PlayingCard>(new Shuffler<PlayingCard>()),
        new Deck()
    ), new RandomDealer(), new NextPlayer(), new IdFactory(), new Date());

CosmosClient GetCribClient()
{
    var accountEndpoint = Environment.GetEnvironmentVariable("COSMOS_ENDPOINT");
    var key = Environment.GetEnvironmentVariable("COSMOS_KEY");
    return new CosmosClient(
        accountEndpoint: accountEndpoint!,
        authKeyOrResourceToken: key!
    );
}

Task<Container> ClearIdPartitionedCribContainer(CosmosClient client, string containerName)
{
    return ClearPartitionedCribContainer(client, containerName, "/id");
}

async Task<Container> ClearPartitionedCribContainer(CosmosClient client, string containerName, string partitionKey)
{
    var container = client.GetCribContainer(containerName);
    var response = await container.DeleteContainerAsync();
    if (response.StatusCode != System.Net.HttpStatusCode.NoContent)
    {
        throw new Exception("Failed to delete container");
    }
    response = await client.GetCribDatabase().CreateContainerAsync(containerName, partitionKey);
    if (response.StatusCode != System.Net.HttpStatusCode.Created)
    {
        throw new Exception("Failed to create container");
    }
    return response.Container;
}

async Task CreateMatches(CosmosClient client)
{
    await ClearIdPartitionedCribContainer(client, "Players");
    var matchesContainer = await ClearIdPartitionedCribContainer(client, "Matches");

    var match = matchFactory.Create(new MatchOptions(new List<string> { otherId1, otherId2, otherId3 }, "Unlimited",""), myId);
    await cribCosmos.CreateMatchAsync(client, match);
}

async Task CreateFriendships(CosmosClient client)
{
    await ClearPartitionedCribContainer(client, "Friendships", "/player");

    (Friendship inviterFriendship, Friendship inviteeFriendship) CreateAcceptedFriendship(string inviterId, string inviteeId)
    {
        var (inviterFriendship1, inviteeFriendship1) = friendshipService.CreateFriendship(inviterId, inviteeId);
        return (inviterFriendship1 with { Status = FriendshipStatus.Accepted }, inviteeFriendship1 with { Status = FriendshipStatus.Accepted });
    }
    var (inviterFriendship, inviteeFriendship) = CreateAcceptedFriendship(myId, otherId1);
    var acceptedFriendships2 = CreateAcceptedFriendship(otherId2, myId);
    var acceptedFriendships3 = CreateAcceptedFriendship(otherId3, myId);

    // if fails and want to look at why - successful response.StatusCode System.Net.HttpStatusCode.Created
    await cribCosmos.AddFriendshipAsync(inviterFriendship, inviteeFriendship, client);
    await cribCosmos.AddFriendshipAsync(acceptedFriendships2.inviterFriendship, acceptedFriendships2.inviteeFriendship, client);
    await cribCosmos.AddFriendshipAsync(acceptedFriendships3.inviterFriendship, acceptedFriendships3.inviteeFriendship, client);
}

try
{
    using CosmosClient client = GetCribClient();
    await CreateFriendships(client);
    await CreateMatches(client);
}
catch(Exception exc)
{
    Console.WriteLine(exc.ToString());
}


