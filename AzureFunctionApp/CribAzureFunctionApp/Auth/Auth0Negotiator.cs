using CribAzureFunctionApp.Hub;
using Microsoft.Azure.SignalR.Management;
using System.Linq;

namespace CribAzureFunctionApp.Auth
{
    public class Auth0Negotiator : INegotiator
    {
        private readonly IAuth0ClaimsProvider claimsProvider;
        private readonly IAuth0Settings authSettings;

        public Auth0Negotiator(IAuth0ClaimsProvider claimsProvider, IAuth0Settings authSettings)
        {
            this.claimsProvider = claimsProvider;
            this.authSettings = authSettings;
        }

        public NegotiationOptions Negotitate(string token)
        {
            var claims = claimsProvider.Provide(token, authSettings);
            return new NegotiationOptions
            {
                Claims = claims,
                UserId = claims.First(claim => claim.Type == "name").Value
            };
        }
    }
}