using System.Diagnostics.CodeAnalysis;

namespace CribAzureFunctionApp.Auth
{
    [ExcludeFromCodeCoverage]
    public class Auth0Settings : IAuth0Settings
    {
        public string Issuer => "https://dev-jzu1ks76wi2i513m.uk.auth0.com/";

        public string Audience => "WapDWTn1LyQMcXEfXSP6s7HvEQ9jegBZ";

        public string Modulus => "rmpA0PeMynlfgLctwPi45UAT-xbCa1uhYxFyOOsyb8tLM0mNUsv2XPiwzrwAIy7Zpedj_d8PxnH4aEXUWToKaRwcKTw_YlVmebbUiJ4Q_cFkMHXuxjk9Dar3Ko1Wl7mTwYufZ8O9OcMLLJflPmD5kR-Ur1tGQQWRwbs5PMbBBnXa2D4AShEW4IEX1ILm4ggivVdouCgD0zFMRYxuNdAzvkS8Uf-3meObqJETnDYY8lSRIoxy6bTWrP1X91oRYj5E7Ie9LIRQFc8PFlRLqokXiZE3HCqQMGx2ouVZCvdRqZSUAgtGvOgby2ga7fdSgONfopDpBBJZGuztLbWtQfHK6w";

        public string Exponent => "AQAB";
    }
}