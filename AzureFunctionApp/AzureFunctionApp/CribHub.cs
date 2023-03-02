using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Azure.SignalR.Management;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Extensions.SignalRService;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace AzureFunctionApp
{
    public class TestServiceHubContext : ServiceHubContext<ICribClient>
    {
        public override IHubClients<ICribClient> Clients => throw new System.NotImplementedException();

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


    public interface ICribClient
    {
        // method need to be Task / void ?
        Task CalledFromServer(string strArg, int intArg);
        void Other();
    }

    

    //InvocationContext has ConnectId and UserId

    public class CribHub : ServerlessHub<ICribClient>
    {
        public CribHub() { }

        // testing - ServiceHubContext<T> is abstract
        public CribHub(ServiceHubContext<ICribClient> context) : base(context)
        {
        }

        [FunctionName("negotiate")]
        public Task<SignalRConnectionInfo> Negotiate([HttpTrigger(AuthorizationLevel.Anonymous)] HttpRequest req)
        {
            return base.NegotiateAsync(
                new NegotiationOptions { 
                    HttpContext = req.HttpContext,
                }
            );

        }

        // here have an issue with the typescript generation
        // any bindings will be determined to be a parameter provided by the client
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
            return Task.CompletedTask;
        }

        // add if required
        /*[FunctionName(nameof(OnConnected))]

        public Task OnConnected([SignalRTrigger] InvocationContext invocationContext, ILogger logger)
        {
            return Task.CompletedTask;
        }*/

        public Task CalledFromClient(int intArg,string stringArg)
        {
            throw new NotImplementedException();
        }
    }
}