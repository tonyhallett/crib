using Microsoft.Azure.SignalR.Management;

namespace CribAzureFunctionApp.Hub
{
    public interface INegotiator
    {
        NegotiationOptions Negotitate(string token);
    }
}