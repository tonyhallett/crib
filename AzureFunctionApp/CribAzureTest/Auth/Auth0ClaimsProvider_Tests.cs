using CribAzureFunctionApp.Auth;
using Microsoft.IdentityModel.Tokens;
using Moq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CribAzureTest.Auth
{
    public static class JwtGenerator
    {
        private static string GenerateTokenString(IEnumerable<Claim> claims)
        {
            // Define the secret key used to sign the token
            string key = "my_secret_key_123";

            // Define the signing credentials
            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var signingCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);



            // Define the token descriptor
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = signingCredentials
            };

            // Create the token handler
            var tokenHandler = new JwtSecurityTokenHandler();

            // Generate the token string
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return tokenString;
        }

        public static JwtSecurityToken GenerateToken(IEnumerable<Claim> claims)
        {
            return new JwtSecurityToken(GenerateTokenString(claims));
        }
    }

    internal class Auth0ClaimsProvider_Tests
    {
        [Test]
        public void Should_Validate_The_Token_String_Returning_Its_Claims()
        {
            var jwtSecurityToken = JwtGenerator.GenerateToken(Enumerable.Empty<Claim>());
            var tokenClaims = jwtSecurityToken.Claims.ToList();
            var mockAuth0TokenValidator = new Mock<IAuth0TokenValidator>();
            var auth0Settings = new Mock<IAuth0Settings>().Object;
            mockAuth0TokenValidator.Setup(tokenValidator => tokenValidator.Validate("token", auth0Settings)).Returns(jwtSecurityToken);

            var claimsProvider = new Auth0ClaimsProvider(mockAuth0TokenValidator.Object);
            var claims = claimsProvider.Provide("token", auth0Settings);

            Assert.Multiple(() =>
            {
                Assert.That(claims, Has.Count.EqualTo(tokenClaims.Count));
                for (var i = 0; i < claims.Count; i++)
                {
                    Assert.That(claims[i].Type, Is.EqualTo(tokenClaims[i].Type));
                    Assert.That(claims[i].Value, Is.EqualTo(tokenClaims[i].Value));
                }
            });
        }
    }
}
