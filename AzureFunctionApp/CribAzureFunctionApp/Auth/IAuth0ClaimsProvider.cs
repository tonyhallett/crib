using System.Collections.Generic;
using System.Security.Claims;

namespace CribAzureFunctionApp.Auth
{
    public interface IAuth0ClaimsProvider
    {
        IList<Claim> Provide(string token, IAuth0Settings auth0Settings);
    }
}