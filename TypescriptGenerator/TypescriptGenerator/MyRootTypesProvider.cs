using SkbKontur.TypeScript.ContractGenerator;
using SkbKontur.TypeScript.ContractGenerator.Abstractions;
using SkbKontur.TypeScript.ContractGenerator.CodeDom;
using SkbKontur.TypeScript.ContractGenerator.TypeBuilders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace TypescriptGenerator
{
    public class MyCustomTypeGenerator : ICustomTypeGenerator
    {
        private ICustomTypeGenerator theirs = new CustomTypeGenerator();
        public string GetTypeLocation(ITypeInfo type)
        {
            return "index.ts";
        }

        public TypeScriptTypeMemberDeclaration? ResolveProperty(TypeScriptUnit unit, ITypeGenerator typeGenerator, ITypeInfo type, IPropertyInfo property)
        {
            var typeScriptTypeMemberDeclaration =  theirs.ResolveProperty(unit, typeGenerator, type, property);
            return typeScriptTypeMemberDeclaration;
        }

        public ITypeBuildingContext? ResolveType(string initialUnitPath, ITypeGenerator typeGenerator, ITypeInfo type, ITypeScriptUnitFactory unitFactory)
        {
            if (type.IsInterface)
            {
                var attributes = type.GetAttributes(false);
                if (attributes != null)
                {
                    var isClientReceiver = attributes.Any(ai => {
                        return ai.AttributeType.Name == "ClientReceiverAttribute";
                    });
                    if (isClientReceiver)
                    {
                        var unit = unitFactory.GetOrCreateTypeUnit(initialUnitPath);
                        return new MethodTypeBuildingContext(unit, type);
                        
                    }

                }
            }
            
            //var methods = type.GetMethods(BindingFlags.Public | BindingFlags.Instance);
            var typeBuildingContext = theirs.ResolveType(initialUnitPath, typeGenerator,type, unitFactory);
            return typeBuildingContext;
        }
    }

    
    public class HubTypesProvider
    {
        private Type GetClientReceiverType(Type serverlessHubType)
        {
            throw new NotImplementedException();
        }

        public List<Type> GetClientTypes(Type serverlessHubType)
        {
            throw new NotImplementedException();
        }

        //public Type[] GetHubParameterTypes(Assembly hubsAssembly)
        //{
        //    var serverlessHubs = GetServerlessHubs(hubsAssembly);
        //    // need the generic 
        //    serverlessHubs.SelectMany(serverlessHub =>
        //    {
        //        var functionMethods = serverlessHub.GetMethods().Where(method =>
        //        {
        //            var customAttributeData = method.GetCustomAttributesData();
        //            if (customAttributeData == null) {
        //                return false;
        //            }
        //            else
        //            {
        //                return customAttributeData.Any(customAttributeData =>
        //                {
        //                    var attributeName = customAttributeData.AttributeType.Name;
        //                    return attributeName == "FunctionAttribute";
        //                });
        //            };
        //        });

        //        return functionMethods.SelectMany(functionMethod =>
        //        {
        //            var parameters = functionMethod.GetParameters();
        //            return parameters.Where(parameter =>
        //            {
        //                var parameterTypeName = parameter.ParameterType.Name;
        //                if (parameterTypeName == "CancelationToken" || parameterTypeName == "ILogger")
        //                {
        //                    return false;
        //                }
        //                return parameter.CustomAttributes == null;
        //            }).Select(parameter => parameter.ParameterType);
        //        })
        //        // do I need to exclude Negotiate ?

        //}

        public List<ServerlessHubType> GetServerlessHubs(Assembly hubsAssembly)
        {
            return hubsAssembly.GetExportedTypes().Where(ServerlessHubType.IsServerlessHub)
                .Select(type => new ServerlessHubType(type))
                .ToList();
        }
    }

    /*
    interface ICribHub
    {
        Task CalledFromClient(int intArg, string stringArg);
        
    }

    public class CribHub : ServerlessHub<ICribClient>, ICribHub
    
        [FunctionName("negotiate")]
        public Task<SignalRConnectionInfo> Negotiate([HttpTrigger(AuthorizationLevel.Anonymous)] HttpRequest req)
        
 [FunctionName(nameof(Broadcast))]
        /*
            All the hub methods must have an argument of InvocationContext decorated by [SignalRTrigger] attribute
            Parameter binding experience 

            In class based model, [SignalRParameter] is unnecessary because all the arguments are marked as [SignalRParameter] 
            by default except in one of the following situations: 

            The argument is decorated by a binding attribute 

            The argument's type is ILogger or CancellationToken 

            The argument is decorated by attribute [SignalRIgnore] 

    public Task Broadcast([SignalRTrigger] InvocationContext invocationContext, string message, ILogger logger)
    

        */
    public class ServerlessHubType
    {
        public static bool IsServerlessHub(Type type)
        {
            return type.BaseType?.Name == "ServerlessHub`1";
        }
        public Type HubType { get; private set; }
        public Type ClientReceiverType { get; private set; }
        public ServerlessHubType(Type type)
        {
            HubType = type;
            ClientReceiverType = type.BaseType!.GetGenericArguments()[0];
        }
    }

    // will need the other one too
    // need to generate the typescript code for 
    // wrapping the connection too
    internal class MyRootTypesProvider : IRootTypesProvider
    {
        public ITypeInfo[] GetRootTypes()
        {
            var hubTypesProvider = new HubTypesProvider();
            //for now just provide the full path
            var hubsAssembly = Assembly.LoadFile(@"C:\Users\tonyadmin\Documents\crib\AzureFunctionApp\AzureFunctionApp\bin\Debug\net6.0\AzureFunctionApp.dll");
            var cribHub = hubTypesProvider.GetServerlessHubs(hubsAssembly)[0];
            var rootTypes = new Type[] { cribHub.ClientReceiverType };
            var theirRootTypesProvider = new RootTypesProvider(rootTypes);
            return theirRootTypesProvider.GetRootTypes();
        }

    }

    public static class TypescriptCreator
    {
        public static string CreateClientCode(Type clientReceiver)
        {
            throw new NotImplementedException();
        }
    }

    public static class Tester
    {
        public static void Test()
        {
            // Reflection only load from is no longer supported
            var hubsAssembly = Assembly.LoadFile(@"C:\\Users\\tonyadmin\\Documents\\crib\\AzureFunctionApp\\AzureFunctionApp\\bin\\Debug\\net6.0\\AzureFunctionApp.dll");
            var hubTypesProvider = new HubTypesProvider();
            var serverlessHubType = hubTypesProvider.GetServerlessHubs(hubsAssembly)[0];
            /*
                what do I want to do with it ?!
                
                Given the client will want to typescript code
                Will want to create typescript classes - will need to run the cli
                to see how it exports so can import the types
                IClientReceiver
            */
        }
    }
}
