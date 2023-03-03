using System.Reflection;

namespace TypescriptGenerator
{
    /*
    

    public class CribHub : ServerlessHub<ICribClient>, ICribHub
    
        [FunctionName("negotiate")]
        public Task<SignalRConnectionInfo> Negotiate([HttpTrigger(AuthorizationLevel.Anonymous)] HttpRequest req)
        
 [FunctionName(nameof(Broadcast))]
        /*
            All the hub methods must have an argument of InvocationContext decorated by [SignalRTrigger] attribute
            --
            Yet elsewhere
            The trigger input type is declared as either InvocationContext or a custom type. 
            If you choose InvocationContext you get full access to the request content. For a custom type, the runtime tries to parse the JSON request body to set the object propertie
            --
            Parameter binding experience 

            In class based model, [SignalRParameter] is unnecessary because all the arguments are marked as [SignalRParameter] 
            by default except in one of the following situations: 

            The argument is decorated by a binding attribute 

            The argument's type is ILogger or CancellationToken 

            The argument is decorated by attribute [SignalRIgnore] 

    public Task Broadcast([SignalRTrigger] InvocationContext invocationContext, string message, ILogger logger)
    

        */
    public class ServerlessHubInfo
    {
        private readonly Type hubType;

        public ServerlessHubInfo(Type hubType)
        {
            this.hubType = hubType;
        }

        public string Name => hubType.Name;
        
        private IEnumerable<MethodInfo> GetFunctionMethods() {
            return hubType.GetMethods().Where(method =>
            {
                var customAttributeData = method.GetCustomAttributesData();
                if (customAttributeData == null)
                {
                    return false;
                }
                else
                {
                    return customAttributeData.Any(customAttributeData =>
                    {
                        var attributeName = customAttributeData.AttributeType.Name;
                        return attributeName == "FunctionAttribute";
                    });
                };
            });
        }
        private IEnumerable<MethodInfo> GetSignalRMethods()
        {
            return GetFunctionMethods().Where(methodInfo =>
            {
                return methodInfo.GetParameters().Any(p =>
                {
                    return p.CustomAttributes.Any(customAttributeData => customAttributeData.AttributeType.Name == "SignalRTriggerAttribute");
                });
            });
        }
        public List<ServerlessHubMethod> GetMethods()
        {
            var ignoredTypes = new List<string> { "InvocationContext", "ILogger", "CancellationToken" };
            return GetSignalRMethods().Select(signalRMethod =>
            {
                return new ServerlessHubMethod(
                    signalRMethod.Name,
                    signalRMethod.GetParameters().Where(parameterInfo =>
                    {
                        if (ignoredTypes.Contains(parameterInfo.ParameterType.Name))
                        {
                            return false;
                        }
                        return !parameterInfo.CustomAttributes.Any(customAttributeData =>
                        {
                            return customAttributeData.AttributeType.Name != "SignalRTriggerAttribute";
                        });
                    }).Select(parameterInfo => new ServerlessHubParameterInfo(parameterInfo.Name!, parameterInfo.ParameterType)).ToList()
                );
            }).ToList();
        }
    }
    
    // evry return type to be a Promise ?
    public class ServerlessHubMethod
    {
        public ServerlessHubMethod(string methodName, List<ServerlessHubParameterInfo> parameters)
        {
            MethodName = methodName;
            Parameters = parameters;
        }

        public string MethodName { get; }
        public List<ServerlessHubParameterInfo> Parameters;
    }

    public class ServerlessHubParameterInfo
    {
        public ServerlessHubParameterInfo(string name, Type type)
        {
            Name = name;
            Type = type;
        }

        public string Name { get; }
        public Type Type { get; }
    }

    public class ServerlessHubType
    {
        public static bool IsServerlessHub(Type type)
        {
            return type.BaseType?.Name == "ServerlessHub`1";
        }
        public ServerlessHubInfo HubInfo { get; private set; }
        public Type ClientReceiverType { get; private set; }
        public ServerlessHubType(Type type)
        {
            HubInfo = new ServerlessHubInfo(type);
            ClientReceiverType = type.BaseType!.GetGenericArguments()[0];
        }
    }
}
