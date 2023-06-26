using Microsoft.AspNetCore.WebUtilities;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Diagnostics.CodeAnalysis;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;

namespace CribAzureFunctionApp.Auth
{
    [ExcludeFromCodeCoverage]
    public class Auth0TokenValidator : IAuth0TokenValidator
    {
        private static string TrimBearer(string token)
        {
            if (token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return token["Bearer ".Length..].Trim();
            }
            return token;
        }

        private static RsaSecurityKey GetSecurityKey(string modulus, string exponent)
        {
            RSACryptoServiceProvider rsa = new();
            rsa.ImportParameters(new RSAParameters()
            {
                Modulus = WebEncoders.Base64UrlDecode(modulus),
                Exponent = WebEncoders.Base64UrlDecode(exponent)
            });

            return new RsaSecurityKey(rsa);
        }

        public JwtSecurityToken Validate(string token, IAuth0Settings settings)
        {
            token = TrimBearer(token);


            var jwtSecurityTokenHandler = new JwtSecurityTokenHandler();
            jwtSecurityTokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                RequireSignedTokens = true,

                ValidateAudience = true,
                ValidAudience = settings.Audience,

                ValidateIssuer = true,
                ValidIssuer = settings.Issuer,

                ValidateIssuerSigningKey = true,
                IssuerSigningKey = GetSecurityKey(settings.Modulus, settings.Exponent)
            }, out var validatedToken);
            return validatedToken as JwtSecurityToken;
        }
    }
}