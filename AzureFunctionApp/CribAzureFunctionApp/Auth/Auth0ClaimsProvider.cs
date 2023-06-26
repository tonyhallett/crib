using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace CribAzureFunctionApp.Auth
{
    public class Auth0ClaimsProvider : IAuth0ClaimsProvider
    {
        private readonly IAuth0TokenValidator validator;
        public Auth0ClaimsProvider(IAuth0TokenValidator validator)
        {
            this.validator = validator;
        }

        public IList<Claim> Provide(string token, IAuth0Settings settings)
        {
            var jwtToken = validator.Validate(token, settings);
            return jwtToken.Claims.ToList();
        }
    }
}