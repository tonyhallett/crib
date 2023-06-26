namespace CribAzureFunctionApp.Settings
{
    // if developing locally then need to go in local.settings.json
    public interface IAppSettings
    {
        public string Get(string name);
    }
}