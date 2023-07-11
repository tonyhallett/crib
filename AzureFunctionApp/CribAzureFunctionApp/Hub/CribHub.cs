#nullable enable

using CribAzureFunctionApp.Cosmos;
using CribAzureFunctionApp.Friendships;
using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.Change;
using CribAzureFunctionApp.Matches.Creation;
using CribAzureFunctionApp.Matches.MyMatches;
using CribAzureFunctionApp.Matches.Utilities;
using CribAzureFunctionApp.Verification;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.SignalR.Management;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Extensions.SignalRService;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

namespace CribAzureFunctionApp.Hub
{
    public class CribHub : ServerlessHub<CribClient>
    {
        private readonly INegotiator negotiator;
        private readonly ICribCosmos cribCosmos;
        private readonly IMatchFactory matchFactory;
        private readonly IMyMatchFactory myMatchFactory;
        private readonly IMatchLogic matchLogic;
        private readonly IFriendshipService friendshipService;

        [ExcludeFromCodeCoverage]
        public CribHub(
            INegotiator negotiator,
            ICribCosmos cribCosmos,
            IMatchFactory matchFactory,
            IMyMatchFactory myMatchFactory,
            IMatchLogic matchLogic,
            IFriendshipService friendshipService
        ) : base()
        {
            this.negotiator = negotiator;
            this.cribCosmos = cribCosmos;
            this.matchFactory = matchFactory;
            this.myMatchFactory = myMatchFactory;
            this.matchLogic = matchLogic;
            this.friendshipService = friendshipService;
        }

        // testing
        internal CribHub(
            INegotiator negotiator,
            ICribCosmos cribCosmos,
            IMatchFactory matchFactory,
            IMyMatchFactory myMatchFactory,
            IMatchLogic matchLogic,
            IFriendshipService friendshipService,
            ServiceHubContext<CribClient> context) : base(context)
        {
            this.negotiator = negotiator;
            this.cribCosmos = cribCosmos;
            this.matchFactory = matchFactory;
            this.myMatchFactory = myMatchFactory;
            this.matchLogic = matchLogic;
            this.friendshipService = friendshipService;
        }

        // https://github.com/Y-Sindo/azure-sdk-for-net/blob/e22903c98635a305d9c658c79d5f6f675725deab/sdk/signalr/Microsoft.Azure.WebJobs.Extensions.SignalRService/sample/Function.cs
        [FunctionName("negotiate")]
        public Task<SignalRConnectionInfo> NegotiateAsync([HttpTrigger(AuthorizationLevel.Anonymous)] HttpRequest req)
        {
            var negotiationOptions = negotiator.Negotitate(req.Headers.Authorization);

            return NegotiateAsync(negotiationOptions);

        }

        //[FunctionName(nameof(InitialPlayerData))]
        //public Task InitialPlayerData(
        //    [SignalRTrigger] InvocationContext invocationContext,
        //    [CosmosDB("Crib", "Players", Connection = "CosmosConnectionString", Id = "{UserId}", PartitionKey = "{UserId}")] Player player,
        //    ILogger logger)
        //{

        //}

        [FunctionName(nameof(InitialPlayerData))]
        public async Task InitialPlayerData(
            [SignalRTrigger] InvocationContext invocationContext,
            [CosmosDB(Connection = "CosmosConnectionString")] CosmosClient cosmosClient
        )
        {
            var userId = invocationContext.UserId;
            var friendships = await cribCosmos.GetPlayerFriendshipsAsync(cosmosClient, userId);
            var matches = await cribCosmos.GetPlayerMatchesAsync(cosmosClient, userId);
            var myMatches = matches.Select(match => myMatchFactory.ToMyMatch(match, userId)).ToList();
            await Clients.User(invocationContext.UserId).initialPlayerData(friendships, myMatches);
        }

        [FunctionName(nameof(SendFriendRequests))]
        public async Task SendFriendRequests(
            [SignalRTrigger] InvocationContext invocationContext,
            [CosmosDB(Connection = "CosmosConnectionString")] CosmosClient cosmosClient,
            List<string> friends)
        {
            var inviterId = invocationContext.UserId;
            List<Friendship> inviterFriendships = new();
            foreach (var friend in friends)
            {
                var (inviterFriendship, inviteeFriendship) = friendshipService.CreateFriendship(inviterId, friend);
                await cribCosmos.AddFriendshipAsync(inviterFriendship, inviteeFriendship, cosmosClient);
                inviterFriendships.Add(inviterFriendship);
                await Clients.User(friend).friendRequest(inviteeFriendship);
            }

            await Clients.User(inviterId).sentFriendRequests(inviterFriendships);
        }

        [FunctionName(nameof(AcceptFriendRequest))]
        public async Task AcceptFriendRequest(
            [SignalRTrigger] InvocationContext invocationContext,
            [CosmosDB(Connection = "CosmosConnectionString")] CosmosClient cosmosClient,
            Friendship friendship)
        {
            friendshipService.ValidateJsAcceptance(friendship, invocationContext.UserId);

            // if a valid Friendship then should be able to find by id in player partition
            var inviteeFriendship = await cribCosmos.GetFriendshipAsync(friendship.Id, friendship.Player, cosmosClient);
            // if a valid Friendship then should be able to find by otherId in friend partition
            var inviterFriendship = await cribCosmos.GetFriendshipAsync(friendship.OtherId, friendship.Friend, cosmosClient);

            friendshipService.ValidateJsAcceptance(inviterFriendship, inviteeFriendship, invocationContext.UserId);

            inviteeFriendship = inviteeFriendship with { Status = FriendshipStatus.Accepted };
            inviterFriendship = inviterFriendship with { Status = FriendshipStatus.Accepted };
            await cribCosmos.ReplaceFriendshipAsync(inviterFriendship, inviteeFriendship, cosmosClient);

            await Clients.User(inviterFriendship.Player).friendRequestAccepted(inviterFriendship);
            await Clients.User(inviteeFriendship.Player).friendRequestAccepted(inviteeFriendship);// may choose different method name for confirmation
        }


        [FunctionName(nameof(CreateMatch))]
        public async Task CreateMatch(
            [SignalRTrigger] InvocationContext invocationContext,
            [CosmosDB(Connection = "CosmosConnectionString")] CosmosClient cosmosClient,
            MatchOptions matchOptions)
        {
            var matchInviter = invocationContext.UserId;
            VerifyCreateMatchPlayers(matchOptions.OtherPlayers, matchInviter);

            var friendships = await cribCosmos.GetFriendshipsWithPlayersAsync(cosmosClient, matchInviter, matchOptions.OtherPlayers);
            if (friendships.Count != matchOptions.OtherPlayers.Count)
            {
                throw new JsHackingException("You are not friends with all of the match players");
            }

            var anyNotAccepted = friendships.Any(f => f.Status != FriendshipStatus.Accepted);
            if (anyNotAccepted)
            {
                throw new JsHackingException("Not all players have accepted your friendship");
            }

            var match = matchFactory.Create(matchOptions, matchInviter);
            await cribCosmos.CreateMatchAsync(cosmosClient, match);

            foreach (var otherPlayer in matchOptions.OtherPlayers)
            {
                var otherPlayerMatch = myMatchFactory.ToMyMatch(match, otherPlayer);
                await Clients.User(otherPlayer).matchCreated(otherPlayerMatch);// might have two methods - matchInvite / matchCreated
            }
            var inviterMatch = myMatchFactory.ToMyMatch(match, matchInviter);
            await Clients.User(matchInviter).matchCreated(inviterMatch);


        }

        [FunctionName(nameof(Discard))]
        public async Task Discard(
            [SignalRTrigger] InvocationContext invocationContext,
            [CosmosDB(Connection = "CosmosConnectionString")] CosmosClient cosmosClient,
            string matchId, PlayingCard discard1, PlayingCard? discard2)
        {
            var playerId = invocationContext.UserId;

            // will crib cosmos throw like cosmosclient apparently does
            var match = await cribCosmos.ReadMatchAsync(cosmosClient, matchId);
            matchLogic.Discard(match, playerId, discard1, discard2);
            await cribCosmos.ReplaceMatchAsync(cosmosClient, match); // concurrency todo

            foreach (var player in match.GetPlayers().Select(p => p.Id))
            {
                await Clients.User(player).discard(playerId, myMatchFactory.ToMyMatch(match, player)); // todo pass score ? game state TDD CLIENT 
            }

        }

        [FunctionName(nameof(Peg))]
        public async Task Peg(
            [SignalRTrigger] InvocationContext invocationContext,
            [CosmosDB(Connection = "CosmosConnectionString")] CosmosClient cosmosClient,
            string matchId, PlayingCard peggedCard)
        {
            var playerId = invocationContext.UserId;

            var match = await cribCosmos.ReadMatchAsync(cosmosClient, matchId);
            matchLogic.Peg(match, playerId, peggedCard);
            await cribCosmos.ReplaceMatchAsync(cosmosClient, match);

            foreach (var player in match.GetPlayers().Select(p => p.Id))
            {
                await Clients.User(player).peg(playerId, peggedCard, myMatchFactory.ToMyMatch(match, player));
            }

        }

        [FunctionName(nameof(Ready))]
        public async Task Ready(
            [SignalRTrigger] InvocationContext invocationContext,
            [CosmosDB(Connection = "CosmosConnectionString")] CosmosClient cosmosClient,
            string matchId)
        {
            var playerId = invocationContext.UserId;

            // will crib cosmos throw like cosmosclient apparently does
            var match = await cribCosmos.ReadMatchAsync(cosmosClient, matchId);
            matchLogic.Ready(match, playerId);
            await cribCosmos.ReplaceMatchAsync(cosmosClient, match); // concurrency todo

            foreach (var player in match.GetPlayers().Select(p => p.Id))
            {
                await Clients.User(player).ready(playerId, myMatchFactory.ToMyMatch(match, player));
            }
            // tbd what send back
        }


        private static void VerifyCreateMatchPlayers(List<string> otherPlayers, string thisPlayer)
        {
            if (otherPlayers.Count == 0) throw new ArgumentException("CreateMatch options must have at least one other player");
            if (otherPlayers.Count > 3) throw new ArgumentException("CreateMatch options cannot have more than 3 other players");
            foreach (var otherPlayer in otherPlayers)
            {
                // todo need a null check ?
                if (otherPlayer == thisPlayer)
                {
                    throw new ArgumentException("CreateMatch options - cannot play against yourself");
                }
            }

        }

        //[FunctionName(nameof(Broadcast))]
        /*
            All the hub methods must have an argument of InvocationContext decorated by [SignalRTrigger] attribute
            Parameter binding experience 

            In class based model, [SignalRParameter] is unnecessary because all the arguments are marked as [SignalRParameter] 
            by default except in one of the following situations: 

            The argument is decorated by a binding attribute 

            The argument's type is ILogger or CancellationToken 

            The argument is decorated by attribute [SignalRIgnore] 

            ---
            [AttributeUsage(AttributeTargets.ReturnValue | AttributeTargets.Parameter)]
            [Binding] // Place this on an attribute to note that it's a binding attribute.
            public class SignalRTriggerAttribute : Attribute

            This details how bindings work
            // https://github.com/Azure/azure-webjobs-sdk/wiki/Creating-custom-input-and-output-bindings

            https://krvarma.medium.com/custom-extension-for-azure-functions-part-1-triggers-e88e4bc94669
        */

        //InvocationContext has ConnectId and UserId
        //public Task Broadcast([SignalRTrigger] InvocationContext invocationContext, string message, ILogger logger)
        //{
        //    string userId = "";
        //    string claimsMsg = "";
        //    try
        //    {
        //        userId = invocationContext.UserId;
        //        var claims = invocationContext.Claims;
        //        foreach (var kv in claims)
        //        {
        //            claimsMsg += $"{kv.Key} - {kv.Value}, ";
        //        }
        //    }
        //    catch(Exception e)
        //    {
        //        message = e.Message;
        //    }
        //    // try/catch
        //    return Clients.All.ReceivedBroadcast(message, userId, claimsMsg);
        //}

        //add if required
        //[FunctionName(nameof(OnConnected))]

        //public Task OnConnected([SignalRTrigger] InvocationContext invocationContext, ILogger logger)
        //{
        //    return Task.CompletedTask;
        //}
    }
}