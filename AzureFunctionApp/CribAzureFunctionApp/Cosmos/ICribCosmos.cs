using CribAzureFunctionApp.Friendships;
using CribAzureFunctionApp.Matches.State;
using Microsoft.Azure.Cosmos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CribAzureFunctionApp.Cosmos
{
    public interface ICribCosmos
    {
        Task AddFriendshipAsync(Friendship inviterFriendship, Friendship inviteeFriendship, CosmosClient cosmosClient);
        Task CreateMatchAsync(CosmosClient cosmosClient, CribMatch match);
        Task<Friendship> GetFriendshipAsync(string id, string player, CosmosClient cosmosClient);
        Task<List<Friendship>> GetFriendshipsWithPlayersAsync(CosmosClient cosmosClient, string player, List<string> otherPlayers);
        Task<CribMatch> ReadMatchAsync(CosmosClient cosmosClient, string matchId);
        Task<List<Friendship>> GetPlayerFriendshipsAsync(CosmosClient cosmosClient, string userId);
        Task<List<CribMatch>> GetPlayerMatchesAsync(CosmosClient cosmosClient, string userId);
        Task ReplaceFriendshipAsync(Friendship inviterFriendship, Friendship inviteeFriendship, CosmosClient cosmosClient);
        Task ReplaceMatchAsync(CosmosClient cosmosClient, CribMatch match);
    }
}