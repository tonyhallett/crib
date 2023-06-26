using SkbKontur.TypeScript.ContractGenerator;
using SkbKontur.TypeScript.ContractGenerator.Abstractions;
using SkbKontur.TypeScript.ContractGenerator.CodeDom;
using SkbKontur.TypeScript.ContractGenerator.Internals;
using SkbKontur.TypeScript.ContractGenerator.TypeBuilders;

namespace TypescriptGenerator
{
    public class DateAsDateTypeBuildingContext : TypeBuildingContextBase
    {
        private static readonly Dictionary<ITypeInfo, string> builtinTypes = new Dictionary<ITypeInfo, string>
        {
            {
                TypeInfo.From<DateTime>(),
                "Date"
            },
        };

        public DateAsDateTypeBuildingContext(ITypeInfo type)
            : base(type)
        {
        }

        public static bool Accept(ITypeInfo type)
        {
            return builtinTypes.ContainsKey(type);
        }

        protected override TypeScriptType ReferenceFromInternal(ITypeInfo type, TypeScriptUnit targetUnit, ITypeGenerator typeGenerator)
        {
            if (builtinTypes.TryGetValue(type, out var value))
            {
                return new TypeScriptBuildInType(value);
            }

            throw new ArgumentOutOfRangeException("type", $"Type '{type}' is not found");
        }
    }
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
            if (DateAsDateTypeBuildingContext.Accept(type))
            {
                return new DateAsDateTypeBuildingContext(type);
            }
            return null;
        }
    }

}
