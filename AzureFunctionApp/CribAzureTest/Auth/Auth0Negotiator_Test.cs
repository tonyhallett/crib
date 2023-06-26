using CribAzureFunctionApp.Auth;
using Moq;
using System.Security.Claims;

namespace CribAzureTest.Auth
{
    internal class Auth0Negotiator_Test
    {
        [Test]
        public void Should_Return_Options_With_Claims_From_The_ClaimsProvider_And_UserId_From_The_Name_Claim()
        {
            var mockClaimsProvider = new Mock<IAuth0ClaimsProvider>();
            var authSettings = new Mock<IAuth0Settings>().Object;
            var nameClaim = new Claim("name", "user id");
            IList<Claim> claims = new List<Claim> { nameClaim };

            mockClaimsProvider.Setup(cp => cp.Provide("token", authSettings)).Returns(claims);

            var auth0Negotiator = new Auth0Negotiator(mockClaimsProvider.Object, authSettings);

            var negotiateOptions = auth0Negotiator.Negotitate("token");
            Assert.Multiple(() =>
            {
                Assert.That(negotiateOptions.UserId, Is.EqualTo("user id"));
                Assert.That(negotiateOptions.Claims, Is.EqualTo(claims));
            });
        }
    }
}
