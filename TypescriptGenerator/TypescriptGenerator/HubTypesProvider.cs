using System.Reflection;

namespace TypescriptGenerator
{
    public class HubTypesProvider : IHubTypesProvider
    {
        
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

}
