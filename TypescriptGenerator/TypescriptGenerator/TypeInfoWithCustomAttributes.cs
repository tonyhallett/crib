using SkbKontur.TypeScript.ContractGenerator;
using SkbKontur.TypeScript.ContractGenerator.Abstractions;
using TheirIAttributeInfo = SkbKontur.TypeScript.ContractGenerator.Abstractions.IAttributeInfo;
using System.Reflection;

namespace TypescriptGenerator
{
    public class TypeInfoWithCustomAttributes : ITypeInfo
    {
        private ITypeInfo wrappedTypeInfo;
        private readonly TheirIAttributeInfo[] attributes;

        public TypeInfoWithCustomAttributes(ITypeInfo wrappedTypeInfo, TheirIAttributeInfo[] attributes)
        {
            this.wrappedTypeInfo = wrappedTypeInfo;
            this.attributes = attributes;
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
            return attributes;
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
            return wrappedTypeInfo.GetMethods(bindingAttr);
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
    }
}
