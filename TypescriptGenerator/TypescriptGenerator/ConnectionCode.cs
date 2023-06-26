using SkbKontur.TypeScript.ContractGenerator;
using TheirTypeInfo = SkbKontur.TypeScript.ContractGenerator.Internals.TypeInfo;
using SkbKontur.TypeScript.ContractGenerator.CodeDom;

namespace TypescriptGenerator
{
    public class ConnectionCode : TypeScriptStatement
    {
        private readonly TypeScriptGenerator typeScriptGenerator;
        private readonly TypeScriptUnit unit;
        private readonly List<ServerlessHubType> serverlessHubs;

        public ConnectionCode(TypeScriptGenerator typeScriptGenerator, TypeScriptUnit unit, List<ServerlessHubType> serverlessHubs) {
            this.typeScriptGenerator = typeScriptGenerator;
            this.unit = unit;
            this.serverlessHubs = serverlessHubs;
        }

        private string GetHubMethod(ServerlessHubMethod serverlessHubMethod)
        {
            var tsMethodName = LowercaseFirstLetter(serverlessHubMethod.MethodName);
            var typedMethod = "(";
            var argNames = "";
            for(var i = 0; i < serverlessHubMethod.Parameters.Count; i++)
            {
                var parameter = serverlessHubMethod.Parameters[i];
                var isNullable = parameter.Nullable;
                var parameterNameOptional = isNullable ? "?" : "";
                if(i != 0)
                {
                    typedMethod+=", ";
                    argNames += ", ";
                }
                typedMethod += $"{parameter.Name}{parameterNameOptional}:{GetTypeName(parameter.Type)}";
                argNames+= parameter.Name;
            }
            typedMethod += ")";
            var sendComma = argNames.Length == 0 ? "" : ", ";

            // does the connection.send method name need to be the same case as cs
            return $"           {tsMethodName}:{typedMethod} => connection.send('{serverlessHubMethod.MethodName}'{sendComma}{argNames}),";
        }
        
        private static string LowercaseFirstLetter(string word)
        {
            return $"{word[..1].ToLower()}{word[1..]}";
        }

        private string CreateHubFactory()
        {
            var hubsAndFactoryMethods = serverlessHubs.Select(serverlessHub =>
            {
                var hub = serverlessHub.HubInfo;
                var hubMethods = hub.GetMethods().Select(hubMethod => GetHubMethod(hubMethod));
                var tsHubMethods = string.Join(Environment.NewLine, hubMethods);
                var hubFactoryMethodName = LowercaseFirstLetter(hub.Name);
                if (hubFactoryMethodName.EndsWith("Hub"))
                {
                    hubFactoryMethodName = hubFactoryMethodName[..^3];
                }
                /*
const ref = useRef<ReturnType<(typeof hubFactory)["crib"]>|undefined>(undefined) 
export const hubFactory = { 
    crib(connection:signalR.HubConnection){ 

        return { 
           broadcast:(clientCallingServer:ClientCallingServer) => connection.send('Broadcast', clientCallingServer), 
        } 
    }, 
} 
Do need to create ICribHub – use the same method 
                */
                var hubFactoryMethod = $@"
    {hubFactoryMethodName}(connection:signalR.HubConnection){{
        return {{
{tsHubMethods}
        }}
    }},{Environment.NewLine}
";
                var hubType = $"export type {hub.Name} = ReturnType<(typeof hubFactory)['{hubFactoryMethodName}']>";
                return (hubFactoryMethod, hubType);
            });
            return $@"
export const hubFactory = {{
{string.Join(",", hubsAndFactoryMethods.Select(hubAndFactoryMethod => hubAndFactoryMethod.hubFactoryMethod))}
}}
{string.Join(Environment.NewLine, hubsAndFactoryMethods.Select(hubAndFactoryMethod => hubAndFactoryMethod.hubType))}
";
        }

        private const string typedConnection = @"
interface ITypedConnection<T> {
    toggleAll(on:boolean):void
    off(toOff:keyof T):void
    on(toOn:keyof T):void
}

type UntypedHandler = Parameters<signalR.HubConnection[""on""]>[1];
type UntypedClient<T> = {
    [Property in keyof T]:UntypedHandler
}

class TypedConnection<T> implements ITypedConnection<T>{
    constructor(
        private untypedClient:UntypedClient<T>, 
        private connection:signalR.HubConnection,
        addHandlers:boolean = true
    ){
        if(addHandlers){
            this.addHandlers();
        }
    }  
    
    addHandlers(){
        for(const method in this.untypedClient){
            this.connection.on(method,this.untypedClient[method as keyof UntypedClient<T>]);
        }
    }
    removeHandlers(){
        for(const method in this.untypedClient){
            this.connection.off(method,this.untypedClient[method as keyof UntypedClient<T>]);
        }
    } 
    toggleAll(on:boolean){
        if(on){
            this.addHandlers();
        }else{
            this.removeHandlers();
        }
    }

    off(toOff:Extract<keyof T, string>){
        this.connection.off(toOff,this.untypedClient[toOff]);
    }

    on(toOn:Extract<keyof T, string>){
        this.connection.on(toOn,this.untypedClient[toOn]);
    }
}

";

        private string GetTypeName(Type type)
        {
            return typeScriptGenerator.BuildAndImportType(unit, TheirTypeInfo.From(type)).GenerateCode(context!);
            //if(builtinTypes.TryGetValue(type, out var typeName))
            //{
            //    return typeName;
            //}
            //return type.Name;
        }

        /*private static readonly Dictionary<Type, string> builtinTypes = new()
        {
                {typeof(bool), "boolean"},
                {typeof(int), "number"},
                {typeof(uint), "number"},
                {typeof(short), "number"},
                {typeof(ushort), "number"},
                {typeof(byte), "number"},
                {typeof(sbyte), "number"},
                {typeof(float), "number"},
                {typeof(double), "number"},
                {typeof(decimal), "number"},
                //{typeof(DateTime), "(Date | string)"},
                //{typeof(DateTimeOffset), "(Date | string)"},
                //{typeof(TimeSpan), "(number | string)"},
                {typeof(string), "string"},
                {typeof(long), "number"},
                {typeof(ulong), "number"},
                //{typeof(byte[]), "string"},
                //{typeof(Guid>(), "string"},
                {typeof(char), "string"},
                {typeof(object), "object"},
                {typeof(void), "void"} 
        };*/
        private ICodeGenerationContext? context;

        private string CreateClientFactory()
        {
            var factoryMethods = serverlessHubs.Select(serverlessHub =>
            {
                var clientCalledFromServer = serverlessHub.ClientReceiverType;
                var factoryMethodName = LowercaseFirstLetter(clientCalledFromServer.Name);
                if (factoryMethodName.EndsWith("Client"))
                {
                    factoryMethodName = factoryMethodName[..^6];
                }
                var receiverType = $"{clientCalledFromServer.Name}";

                var untypedClientMethods = clientCalledFromServer.GetMethods().Select(method =>
                {
                    var methodName = LowercaseFirstLetter(method.Name);
                    
                    var typedMethod = "(";
                    var argNames = "";
                    var methodParameters = method.GetParameters();
                    for (var i = 0; i < methodParameters.Length; i++)
                    {
                        var parameter = methodParameters[i];
                        if (i != 0)
                        {
                            typedMethod += ", ";
                            argNames += ", ";
                        }
                        typedMethod += $"{parameter.Name}:{GetTypeName(parameter.ParameterType)}";
                        argNames += parameter.Name;
                    }
                    typedMethod += ")";

                    return @$"
            {methodName}{typedMethod}{{
                return client.{methodName}({argNames});
            }},";
                });

                return @$"
    {factoryMethodName}(connection:signalR.HubConnection, client: {receiverType}): ITypedConnection<{receiverType}>{{
        const untypedClient:UntypedClient<{receiverType}> = {{
{string.Join(Environment.NewLine, untypedClientMethods)}
        }}

        return new TypedConnection(untypedClient, connection);
    }},
";
            });
            return
@$"export const clientFactory = {{
{string.Join(Environment.NewLine, factoryMethods)}
}}";
        }
        
        public override string GenerateCode(ICodeGenerationContext context)
        {
            this.context = context;
            /*
                I will need to considerMessage Pack format
            */
            return @$"  
{CreateHubFactory()}
{typedConnection}
{CreateClientFactory()}
            ";
        }
    }

}
