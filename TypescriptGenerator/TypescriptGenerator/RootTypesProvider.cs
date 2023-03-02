using SkbKontur.TypeScript.ContractGenerator;
using SkbKontur.TypeScript.ContractGenerator.Abstractions;
using System.Reflection;

namespace TypescriptGenerator
{
    internal class RootTypesProvider : IRootTypesProvider, IHubClientTypeProvider
    {
        private readonly string hubsAssemblyPath;
        private readonly IHubTypesProvider hubTypesProvider;

        public RootTypesProvider(string hubsAssemblyPath, IHubTypesProvider hubTypesProvider)
        {
            this.hubsAssemblyPath = hubsAssemblyPath;
            this.hubTypesProvider = hubTypesProvider;
        }
        public ITypeInfo[] GetRootTypes()
        {
            var hubsAssembly = Assembly.LoadFile(hubsAssemblyPath);
            var serverlessHubs = hubTypesProvider.GetServerlessHubs(hubsAssembly);
            return serverlessHubs.SelectMany(serverlessHub =>
            {
                var hubInfo = serverlessHub.HubInfo;
                var allParameterTypes = hubInfo.GetMethods().SelectMany(hubMethod => hubMethod.Parameters.Select(p => p.Type));
                    //.Select(t => TypeInfo.From(t);
                return new ITypeInfo[] { CreateHubClientType(serverlessHub.ClientReceiverType) };
            }).ToArray();
        }

        private ITypeInfo CreateHubClientType(Type clientType)
        {
            return new TypeInfoWithCustomAttributes(
                    clientType,
                    new IAttributeInfo[] { HubClientAttributeInfo.Instance }
                );
        }

        public bool IsHubClientType(ITypeInfo typeInfo)
        {
            var isHubType = false;
            if (typeInfo.IsInterface)
            {
                var attributes = typeInfo.GetAttributes(false);
                if (attributes != null)
                {
                    isHubType = attributes.Any(ai =>
                    {
                        return ai == HubClientAttributeInfo.Instance;
                    });
                }
            }
            return isHubType;
        }

    }
}
