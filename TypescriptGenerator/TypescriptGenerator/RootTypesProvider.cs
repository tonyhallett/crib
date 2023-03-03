using SkbKontur.TypeScript.ContractGenerator;
using SkbKontur.TypeScript.ContractGenerator.Abstractions;
using TypeInfoFactory = SkbKontur.TypeScript.ContractGenerator.Internals.TypeInfo;
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
                
                // do not need the hub in the typescript
                var hubParameterTypes = hubInfo.GetMethods().SelectMany(hubMethod => hubMethod.Parameters.Select(p => p.Type))
                    .Select(t => TypeInfoFactory.From(t));
                var types = new List<ITypeInfo>(hubParameterTypes);
                // do need the hub client in the typescript
                types.Add(CreateHubClientType(serverlessHub.ClientReceiverType));
                return types;
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
