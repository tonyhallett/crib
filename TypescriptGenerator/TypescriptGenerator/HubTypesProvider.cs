using System.Reflection;

namespace TypescriptGenerator
{
    public class HubTypesProvider : IHubTypesProvider
    {
        private List<ServerlessHubType>? serverlessHubTypes;

        public List<ServerlessHubType> ServerlessHubs => serverlessHubTypes!;

        public List<ServerlessHubType> GetServerlessHubs(Assembly hubsAssembly)
        {
            if(serverlessHubTypes == null)
            {
                serverlessHubTypes = hubsAssembly.GetExportedTypes().Where(ServerlessHubType.IsServerlessHub)
                .Select(type => new ServerlessHubType(type))
                .ToList();
            }
            return serverlessHubTypes!;
            
        }
    }

}
