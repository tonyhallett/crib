using Azure.Core.Serialization;
using CribAzureFunctionApp.Auth;
using CribAzureFunctionApp.Cosmos;
using CribAzureFunctionApp.Friendships;
using CribAzureFunctionApp.Hub;
using CribAzureFunctionApp.Matches.Card;
using CribAzureFunctionApp.Matches.Change;
using CribAzureFunctionApp.Matches.Creation;
using CribAzureFunctionApp.Matches.Deal;
using CribAzureFunctionApp.Matches.MyMatches;
using CribAzureFunctionApp.Matches.Scoring;
using CribAzureFunctionApp.Matches.Scoring.Match;
using CribAzureFunctionApp.Matches.Scoring.Match.Utilities;
using CribAzureFunctionApp.Matches.Scoring.Scorer;
using CribAzureFunctionApp.Matches.Utilities;
using CribAzureFunctionApp.Utilities;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Azure.WebJobs.Extensions.SignalRService;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using System.Collections.Generic;

[assembly: FunctionsStartup(typeof(CribAzureFunctionApp.Startup))]

namespace CribAzureFunctionApp
{
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            builder.Services.AddSingleton<INegotiator, Auth0Negotiator>();
            builder.Services.AddSingleton<IAuth0ClaimsProvider, Auth0ClaimsProvider>();
            builder.Services.AddSingleton<IAuth0Settings, Auth0Settings>();
            builder.Services.AddSingleton<IAuth0TokenValidator, Auth0TokenValidator>();
            builder.Services.AddSingleton<ICribCosmos, CribCosmos>();
            builder.Services.AddSingleton<IFeedIterator, FeedIterator>();
            builder.Services.AddSingleton<IMatchFactory, MatchFactory>();
            builder.Services.AddSingleton<ICribPlayingCardsProvider<PlayingCard>, CribPlayingCardsProvider<PlayingCard>>();
            builder.Services.AddSingleton<IShuffler<PlayingCard>, Shuffler<PlayingCard>>();
            builder.Services.AddSingleton<IDeck, Deck>();
            builder.Services.AddSingleton<IRandomDealer, RandomDealer>();
            builder.Services.AddSingleton<ICribDealer, CribDealer>();
            builder.Services.AddSingleton<INextPlayer, NextPlayer>();
            builder.Services.AddSingleton<IMatchLogic, MatchLogic>();
            builder.Services.AddSingleton<IMatchVerifier, MatchVerifier>();
            builder.Services.AddSingleton<ICribMatchScorer, CribMatchScorer>();
            builder.Services.AddSingleton<IScoreFinder, ScoreFinder>();
            builder.Services.AddSingleton<IScoreIncrementer, ScoreIncrementer>();
            builder.Services.AddSingleton<ICribScorer, CribScorer>();
            builder.Services.AddSingleton<IHandReconstructor, HandReconstructor>();
            builder.Services.AddSingleton<IIdFactory, IdFactory>();
            builder.Services.AddSingleton<IFriendshipService, FriendshipService>();
            builder.Services.AddSingleton<IDate, Date>();
            builder.Services.AddSingleton<IMyMatchFactory, MyMatchFactory>();

            builder.Services.Configure<SignalROptions>(o => o.JsonObjectSerializer = new NewtonsoftJsonObjectSerializer(
                new Newtonsoft.Json.JsonSerializerSettings()
                {
                    Converters = new List<Newtonsoft.Json.JsonConverter>() {
                    new NewtonsoftJsonETagConverter(),
                    new StringEnumConverter(),
                },
                    ContractResolver = new DefaultContractResolver
                    {
                        NamingStrategy = new CamelCaseNamingStrategy()
                    }
                })
            );
        }
    }
}
