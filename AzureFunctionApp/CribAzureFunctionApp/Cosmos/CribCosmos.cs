#nullable enable

using CribAzureFunctionApp.Friendships;
using CribAzureFunctionApp.Matches.State;
using CribAzureFunctionApp.Matches.Utilities;
using Microsoft.Azure.Cosmos;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CribAzureFunctionApp.Cosmos
{
    public class CribCosmos : ICribCosmos
    {
        private readonly IFeedIterator feedIterator;

        public CribCosmos(IFeedIterator feedIterator)
        {
            this.feedIterator = feedIterator;
        }

        public async Task AddFriendshipAsync(Friendship inviterFriendship, Friendship inviteeFriendship, CosmosClient cosmosClient)
        {
            // todo - both need to succeed
            var friendshipContainer = cosmosClient.GetFriendshipsContainer();
            await friendshipContainer.CreateItemAsync(inviterFriendship, new PartitionKey(inviterFriendship.Player));
            await friendshipContainer.CreateItemAsync(inviteeFriendship, new PartitionKey(inviteeFriendship.Player));
        }

        public async Task<Friendship> GetFriendshipAsync(string id, string player, CosmosClient cosmosClient)
        {
            var friendshipContainer = cosmosClient.GetFriendshipsContainer();
            return await friendshipContainer.ReadItemAsync<Friendship>(id, new PartitionKey(player));
        }

        public Task<List<Friendship>> GetFriendshipsWithPlayersAsync(CosmosClient cosmosClient, string player, List<string> otherPlayers)
        {
            var friendshipsContainer = cosmosClient.GetFriendshipsContainer();
            // better to filter in code ?
            /*
                from ToQueryDefinition.QueryText
                "SELECT VALUE root FROM root WHERE ((root[\"player\"] = \"matchinviter\") AND (root[\"friend\"] IN (\"p1\", \"p2\", \"p3\")))"
            */
            var queryablefriendships = friendshipsContainer.GetItemLinqQueryable<Friendship>(requestOptions: new QueryRequestOptions { PartitionKey = new PartitionKey(player) })
                .Where(f => f.Player == player && otherPlayers.Contains(f.Friend));
            return feedIterator.GetAllAsync(queryablefriendships);
        }

        public async Task ReplaceFriendshipAsync(Friendship inviterFriendship, Friendship inviteeFriendship, CosmosClient cosmosClient)
        {
            var friendshipContainer = cosmosClient.GetFriendshipsContainer();
            await friendshipContainer.ReplaceItemAsync(inviterFriendship, inviterFriendship.Id, new PartitionKey(inviterFriendship.Player));
            await friendshipContainer.ReplaceItemAsync(inviteeFriendship, inviteeFriendship.Id, new PartitionKey(inviteeFriendship.Player));
        }

        public async Task<List<Friendship>> GetPlayerFriendshipsAsync(CosmosClient cosmosClient, string userId)
        {
            var friendshipsContainer = cosmosClient.GetFriendshipsContainer();
            var queryablefriendships = friendshipsContainer.GetItemLinqQueryable<Friendship>(requestOptions: new QueryRequestOptions { PartitionKey = new PartitionKey(userId) })
                .Where(f => f.Player == userId);
            return await feedIterator.GetAllAsync(queryablefriendships);
        }

        public async Task<List<CribMatch>> GetPlayerMatchesAsync(CosmosClient cosmosClient, string userId)
        {
            var matchesContainer = cosmosClient.GetMatchesContainer();
            var matches = new List<CribMatch>();

            Player? player = await cosmosClient.GetPlayersContainer().TryReadItemAsync<Player>(userId, new PartitionKey(userId));
            if (player != null)
            {
                var matchIds = player.matchIds;
                foreach (var matchId in matchIds)
                {
                    var match = await matchesContainer.ReadItemAsync<CribMatch>(matchId, new PartitionKey(matchId));
                    matches.Add(match);
                }
            }

            return matches;
        }


        public async Task CreateMatchAsync(CosmosClient cosmosClient, CribMatch match)
        {
            await cosmosClient.GetMatchesContainer().CreateItemAsync(match, new PartitionKey(match.Id));
            var playersContainer = cosmosClient.GetPlayersContainer();
            foreach (var matchPlayer in match.GetPlayers())
            {
                Player? player = await playersContainer.TryReadItemAsync<Player>(matchPlayer.Id, new PartitionKey(matchPlayer.Id));
                if (player != null)
                {
                    player.matchIds.Add(match.Id);
                    await playersContainer.ReplaceItemAsync(player, player.id, new PartitionKey(player.id));
                }
                else
                {
                    await playersContainer.CreateItemAsync(new Player(matchPlayer.Id, new List<string> { match.Id }), new PartitionKey(matchPlayer.Id));
                }
            }
        }

        public async Task<CribMatch> ReadMatchAsync(CosmosClient cosmosClient, string matchId)
        {
            CribMatch match = await cosmosClient.GetMatchesContainer().ReadItemAsync<CribMatch>(matchId, new PartitionKey(matchId));
            return match;
        }



        public Task ReplaceMatchAsync(CosmosClient cosmosClient, CribMatch match)
        {
            return cosmosClient.GetMatchesContainer().ReplaceItemAsync(match, match.Id, new PartitionKey(match.Id));
        }
    }
}