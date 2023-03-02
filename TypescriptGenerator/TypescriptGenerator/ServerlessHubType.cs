using System.Reflection;

namespace TypescriptGenerator
{
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
    public class ServerlessHubInfo
    {
        public ServerlessHubInfo(Type hubType)
        {

        }

        public List<ServerlessHubMethod> GetMethods()
        {
            // have some existing code for this - will want to drive from outside
            throw new NotImplementedException();
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
