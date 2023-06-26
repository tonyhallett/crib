using System.IdentityModel.Tokens.Jwt;

namespace CribAzureFunctionApp.Auth
{
    public interface IAuth0TokenValidator
    {
        JwtSecurityToken Validate(string token, IAuth0Settings settings);
    }
}