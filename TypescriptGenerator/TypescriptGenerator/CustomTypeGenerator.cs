using SkbKontur.TypeScript.ContractGenerator;
using SkbKontur.TypeScript.ContractGenerator.Abstractions;
using SkbKontur.TypeScript.ContractGenerator.CodeDom;
using SkbKontur.TypeScript.ContractGenerator.TypeBuilders;

namespace TypescriptGenerator
{
    public class CustomTypeGenerator : ICustomTypeGenerator
    {
        private readonly IHubClientTypeProvider hubClientProvider;
        private readonly string outputPath;

        public CustomTypeGenerator(
            IHubClientTypeProvider hubClientProvider,
            string outputPath
        )
        {
            this.hubClientProvider = hubClientProvider;
            this.outputPath = outputPath;
        }
        public string GetTypeLocation(ITypeInfo type)
        {
            return outputPath;
        }

        public TypeScriptTypeMemberDeclaration? ResolveProperty(TypeScriptUnit unit, ITypeGenerator typeGenerator, ITypeInfo type, IPropertyInfo property)
        {
            return null;
        }

        public ITypeBuildingContext? ResolveType(string initialUnitPath, ITypeGenerator typeGenerator, ITypeInfo type, ITypeScriptUnitFactory unitFactory)
        {
            if (hubClientProvider.IsHubClientType(type))
            {
                var unit = unitFactory.GetOrCreateTypeUnit(initialUnitPath);
                return new MethodTypeBuildingContext(unit, type);
            }
            
            return null;
        }
    }

}
