using SkbKontur.TypeScript.ContractGenerator;
using SkbKontur.TypeScript.ContractGenerator.Abstractions;
using SkbKontur.TypeScript.ContractGenerator.CodeDom;
using SkbKontur.TypeScript.ContractGenerator.TypeBuilders;

namespace TypescriptGenerator
{

    public interface IConnectionCodeManager
    {
        void Initialized(HubClientTypeBuildingContext hubClientTypeBuildingContext);
    }


    public interface IConnectionCodeFactory
    {
        TypeScriptStatement CreateCode();
    }

    public class ConnectionCodeFactory : IConnectionCodeFactory
    {
        public TypeScriptStatement CreateCode()
        {
            return new ConnectionCode("Todo");
        }
    }

    public interface IHubClientTypeBuildingContextFactory
    {
        HubClientTypeBuildingContext Create(TypeScriptUnit unit, ITypeInfo typeInfo);
    }

    public class ConnectionCodeManager : IConnectionCodeManager, IHubClientTypeBuildingContextFactory
    {
        private TypeScriptUnit? unit;
        private readonly IConnectionCodeFactory connectionCodeFactory;
        private int initializedCount = 0;
        private List<HubClientTypeBuildingContext> hubClientTypeBuildingContexts = new List<HubClientTypeBuildingContext>();

        public ConnectionCodeManager(IConnectionCodeFactory connectionCodeFactory)
        {
            this.connectionCodeFactory = connectionCodeFactory;
        }

        public void Initialized(HubClientTypeBuildingContext hubClientTypeBuildingContext)
        {
            initializedCount++;
            if(initializedCount == hubClientTypeBuildingContexts.Count)
            {
                AddCode(unit!);
            }
        }

        private void AddCode(TypeScriptUnit unit)
        {
            unit.Body.Add(connectionCodeFactory.CreateCode());
        }


        public HubClientTypeBuildingContext Create(TypeScriptUnit unit, ITypeInfo typeInfo)
        {
            this.unit = unit; // as all code is curently going in one file
            var context = new HubClientTypeBuildingContext(unit, typeInfo, this);
            hubClientTypeBuildingContexts.Add(context);
            return context;
        }
    }

    public class HubClientTypeBuildingContext : MethodTypeBuildingContext
    {
        private readonly IConnectionCodeManager connectionCodeManager;

        public HubClientTypeBuildingContext(
            TypeScriptUnit unit,
            ITypeInfo hubClientTypeInfo,
            IConnectionCodeManager connectionCodeManager) :base(unit, hubClientTypeInfo)
        {
            this.connectionCodeManager = connectionCodeManager;
        }

        public override void Initialize(ITypeGenerator typeGenerator)
        {
            base.Initialize(typeGenerator);
            connectionCodeManager.Initialized(this);
        }
        
    }

    public class CustomTypeGeneratorX : ICustomTypeGenerator
    {
        private readonly IHubClientTypeProvider hubClientProvider;
        private readonly IHubClientTypeBuildingContextFactory hubClientTypeBuildingContextFactory;

        public CustomTypeGeneratorX(
            IHubClientTypeProvider hubClientProvider,
            IHubClientTypeBuildingContextFactory hubClientTypeBuildingContextFactory)
        {
            this.hubClientProvider = hubClientProvider;
            this.hubClientTypeBuildingContextFactory = hubClientTypeBuildingContextFactory;
        }
        public string GetTypeLocation(ITypeInfo type)
        {
            return "index.ts";
        }

        public TypeScriptTypeMemberDeclaration? ResolveProperty(TypeScriptUnit unit, ITypeGenerator typeGenerator, ITypeInfo type, IPropertyInfo property)
        {
            return null;
        }

        public ITypeBuildingContext? ResolveType(string initialUnitPath, ITypeGenerator typeGenerator, ITypeInfo type, ITypeScriptUnitFactory unitFactory)
        {
            //if (hubClientProvider.IsHubClientType(type))
            //{
            //    var unit = unitFactory.GetOrCreateTypeUnit(initialUnitPath);
            //    return hubClientTypeBuildingContextFactory.Create(unit, type);
                
            //}
            
            return null;
        }
    }

}
