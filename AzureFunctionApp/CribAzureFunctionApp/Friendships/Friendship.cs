#nullable enable

using Newtonsoft.Json;
using System;

namespace CribAzureFunctionApp.Friendships
{
    public record Friendship(
        [property:JsonProperty("player")]
        string Player,
        string Friend,
        FriendshipStatus Status,
        DateTime InviteDate,
        bool IsInviter,
        [property:JsonProperty("id")]
        string Id,
        string OtherId);
}