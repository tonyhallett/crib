namespace CribAzureFunctionApp.Auth
{
    public interface IAuth0Settings
    {
        string Issuer { get; }
        string Audience { get; }
        string Modulus { get; }
        string Exponent { get; }
    }
}