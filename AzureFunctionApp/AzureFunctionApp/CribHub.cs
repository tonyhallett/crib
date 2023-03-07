using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Azure.SignalR.Management;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Extensions.SignalRService;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace AzureFunctionApp
{
    public class TestServiceHubContext : ServiceHubContext<CribClient>
    {
        public override IHubClients<CribClient> Clients => throw new System.NotImplementedException();

        // abstract class
        public override GroupManager Groups => throw new System.NotImplementedException();

        // abstract class
        public override UserGroupManager UserGroups => throw new System.NotImplementedException();

        // abstract class
        public override ClientManager ClientManager => throw new System.NotImplementedException();

        public override void Dispose()
        {
            throw new System.NotImplementedException();
        }

        public override ValueTask DisposeAsync()
        {
            throw new System.NotImplementedException();
        }

        public override ValueTask<NegotiationResponse> NegotiateAsync(NegotiationOptions negotiationOptions = null, CancellationToken cancellationToken = default)
        {
            throw new System.NotImplementedException();
        }
    }

    
    public interface CribClient
    {
        Task ReceivedBroadcast(string message,string clientid, string claims);
    }

    

    //InvocationContext has ConnectId and UserId

    public class CribHub : ServerlessHub<CribClient>
    {
        public CribHub() { }

        // testing - ServiceHubContext<T> is abstract
        public CribHub(ServiceHubContext<CribClient> context) : base(context)
        {
        }

        [FunctionName("index")]
        public static IActionResult GetHomePage([HttpTrigger(AuthorizationLevel.Anonymous)] HttpRequest req, Microsoft.Azure.WebJobs.ExecutionContext context)
        {
            var path = Path.Combine(context.FunctionAppDirectory, "content", "index.html");
            return new ContentResult
            {
                Content = File.ReadAllText(path),
                ContentType = "text/html",
            };
        }

        // https://github.com/Y-Sindo/azure-sdk-for-net/blob/e22903c98635a305d9c658c79d5f6f675725deab/sdk/signalr/Microsoft.Azure.WebJobs.Extensions.SignalRService/sample/Function.cs
        [FunctionName("negotiate")]
        public Task<SignalRConnectionInfo> NegotiateAsync([HttpTrigger(AuthorizationLevel.Anonymous)] HttpRequest req)
        {
            // nothing preventing a username field (and password )
            // could even hard code claims

            // is this any different to below ( taken from ServerlessHub<T> example ) ? If not then better ?
            var claimsPrincipal = req.HttpContext.User;
            // claimsPrincipal.Identity?.Name
            //claimsPrincipal.Claims

            var claims = GetClaims(req.Headers["Authorization"]);
            return NegotiateAsync(new NegotiationOptions
            {
                // Gets or sets the user ID. If null, the identity name in <see cref="HttpContext.User" /> will be used.
                UserId = claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value,
                // Gets or sets the claim list to be put into access token. If null, the claims in <see cref="HttpContext.User"/> will be used.
                Claims = claims
            });
        }

        [FunctionName(nameof(Broadcast))]
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


        public Task Broadcast([SignalRTrigger] InvocationContext invocationContext, string message, ILogger logger)
        {
            var userId = invocationContext.UserId;
            var claims = invocationContext.Claims;
            var claimsMsg = "";
            foreach (var kv in claims)
            {
                claimsMsg += $"{kv.Key} - {kv.Value}";
             
            }
            // try/catch
            return Clients.All.ReceivedBroadcast(message, userId, claimsMsg);
        }
        
        // add if required
        /*[FunctionName(nameof(OnConnected))]

        public Task OnConnected([SignalRTrigger] InvocationContext invocationContext, ILogger logger)
        {
            return Task.CompletedTask;
        }*/
    }
}