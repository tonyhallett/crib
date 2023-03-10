using System.Threading.Tasks;

namespace AzureFunctionApp
{
    public interface CribClient
    {
        Task ReceivedBroadcast(string message,string clientid, string claims);
    }
}