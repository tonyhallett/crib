using System.Reflection;

namespace TypescriptGenerator
{
    public interface IHubTypesProvider
    {
        List<ServerlessHubType> GetServerlessHubs(Assembly hubsAssembly);
    }

}
