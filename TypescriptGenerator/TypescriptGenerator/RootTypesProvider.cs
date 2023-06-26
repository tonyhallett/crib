using SkbKontur.TypeScript.ContractGenerator;
using SkbKontur.TypeScript.ContractGenerator.Abstractions;
using TheirTypeInfo = SkbKontur.TypeScript.ContractGenerator.Internals.TypeInfo;
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
            var wrappedTypeInfo = TheirTypeInfo.From(clientType);
            var typeInfoWithCustomAttributes =  new TypeInfoWithCustomAttributes(
                    wrappedTypeInfo,
                    new IAttributeInfo[] { HubClientAttributeInfo.Instance }
                );
            return new TypeInfoChangeReturnToVoid(typeInfoWithCustomAttributes);
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

    public class TypeInfoChangeReturnToVoid : ITypeInfo
    {
        private readonly ITypeInfo wrappedTypeInfo;

        public TypeInfoChangeReturnToVoid(ITypeInfo wrappedTypeInfo)
        {
            this.wrappedTypeInfo = wrappedTypeInfo;
        }
        public string Name => wrappedTypeInfo.Name;

        public string FullName => wrappedTypeInfo.FullName;

        public string Namespace => wrappedTypeInfo.Namespace;

        public bool IsEnum => wrappedTypeInfo.IsEnum;

        public bool IsValueType => wrappedTypeInfo.IsValueType;

        public bool IsArray => wrappedTypeInfo.IsArray;

        public bool IsClass => wrappedTypeInfo.IsClass;

        public bool IsInterface => wrappedTypeInfo.IsInterface;

        public bool IsAbstract => wrappedTypeInfo.IsAbstract;

        public bool IsGenericType => wrappedTypeInfo.IsGenericType;

        public bool IsGenericParameter => wrappedTypeInfo.IsGenericParameter;

        public bool IsGenericTypeDefinition => wrappedTypeInfo.IsGenericTypeDefinition;

        public ITypeInfo? BaseType => wrappedTypeInfo.BaseType;

        public IAttributeProvider? Member => wrappedTypeInfo.Member;

        public IAssemblyInfo Assembly => wrappedTypeInfo.Assembly;

        public bool CanBeNull(NullabilityMode nullabilityMode)
        {
            return wrappedTypeInfo.CanBeNull(nullabilityMode);
        }

        public bool Equals(ITypeInfo? other)
        {
            return wrappedTypeInfo.Equals(other);
        }

        public IAttributeInfo[] GetAttributes(bool inherit)
        {
            return wrappedTypeInfo.GetAttributes(inherit);
        }

        public ITypeInfo GetElementType()
        {
            return wrappedTypeInfo.GetElementType();
        }

        public string[] GetEnumNames()
        {
            return wrappedTypeInfo.GetEnumNames();
        }

        public IFieldInfo[] GetFields(BindingFlags bindingAttr)
        {
            return wrappedTypeInfo.GetFields(bindingAttr);
        }

        public ITypeInfo[] GetGenericArguments()
        {
            return wrappedTypeInfo.GetGenericArguments();
        }

        public ITypeInfo GetGenericTypeDefinition()
        {
            return wrappedTypeInfo.GetGenericTypeDefinition();
        }

        public ITypeInfo[] GetInterfaces()
        {
            return wrappedTypeInfo.GetInterfaces();
        }

        public IMethodInfo[] GetMethods(BindingFlags bindingAttr)
        {
            return wrappedTypeInfo.GetMethods(bindingAttr).Select(methodInfo =>
            {
                return new MethodInfoChangeType(methodInfo, TheirTypeInfo.From(typeof(void)));
            }).ToArray();
        }

        public IPropertyInfo[] GetProperties(BindingFlags bindingAttr)
        {
            return wrappedTypeInfo.GetProperties(bindingAttr);
        }

        public bool IsAssignableFrom(ITypeInfo type)
        {
            return wrappedTypeInfo.IsAssignableFrom(type);
        }

        public ITypeInfo WithMemberInfo(IAttributeProvider memberInfo)
        {
            throw new NotImplementedException();
        }

        public class MethodInfoChangeType : IMethodInfo
        {
            private readonly IMethodInfo wrappedMethodInfo;
            private readonly ITypeInfo newReturnType;

            public MethodInfoChangeType(IMethodInfo wrappedMethodInfo, ITypeInfo newReturnType)
            {
                this.wrappedMethodInfo = wrappedMethodInfo;
                this.newReturnType = newReturnType;
            }

            public string Name => wrappedMethodInfo.Name;

            public ITypeInfo ReturnType => this.newReturnType;

            public ITypeInfo? DeclaringType => wrappedMethodInfo.DeclaringType;

            public IAttributeInfo[] GetAttributes(bool inherit)
            {
                return wrappedMethodInfo.GetAttributes(inherit);
            }

            public IParameterInfo[] GetParameters()
            {
                return wrappedMethodInfo.GetParameters();
            }
        }
    }
}
