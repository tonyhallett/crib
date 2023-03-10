using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Azure.SignalR.Management;
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
}