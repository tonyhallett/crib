using SkbKontur.TypeScript.ContractGenerator;
using SkbKontur.TypeScript.ContractGenerator.Abstractions;
using SkbKontur.TypeScript.ContractGenerator.CodeDom;
using SkbKontur.TypeScript.ContractGenerator.Extensions;
using SkbKontur.TypeScript.ContractGenerator.TypeBuilders;
using System.Reflection;

namespace TypescriptGenerator
{
    // https://github.com/skbkontur/TypeScript.ContractGenerator/blob/e55d3718d6d999bbb19814fc6ccfa15265d91b98/TypeScript.ContractGenerator.Tests/CustomTypeGenerators/MethodTypeBuildingContext.cs
    public class MethodTypeBuildingContext : TypeBuildingContext
    {
        public MethodTypeBuildingContext(TypeScriptUnit unit, ITypeInfo type)
            : base(unit, type)
        {
        }

        public override void Initialize(ITypeGenerator typeGenerator)
        {
            var definition = new TypeScriptInterfaceDefinition();

            definition.Members.AddRange(
                Type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                .Where(m => !m.Name.Contains("_"))
                .Select(m => new TypeScriptInterfaceFunctionMember(
                    m.Name.ToLowerCamelCase(), 
                    typeGenerator.BuildAndImportType(Unit, m.ReturnType),
                    m.GetParameters()
                        .Select(p => new TypeScriptArgumentDeclaration
                        {
                            Name = p.Name,
                            Optional = false,
                            Type = typeGenerator.BuildAndImportType(Unit, p.ParameterType),
                        })
                        .ToArray()
                    )
                )
            );

            definition.Members.AddRange(
                Type.GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                .Select(x => new TypeScriptInterfacePropertyMember(
                    x.Name.ToLowerCamelCase(), 
                    typeGenerator.BuildAndImportType(Unit, x.PropertyType)
                    )
                )
            );

            Declaration = new TypeScriptInterfaceDeclaration { Definition = definition, Name = Type.Name };

            base.Initialize(typeGenerator);
        }
    }
}
