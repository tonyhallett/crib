using SkbKontur.TypeScript.ContractGenerator;
using SkbKontur.TypeScript.ContractGenerator.Abstractions;
using SkbKontur.TypeScript.ContractGenerator.CodeDom;
using System.Reflection;

namespace TypescriptGenerator
{
    public static class TypescriptUnitImports
    {
        private static FieldInfo importsField = typeof(TypeScriptUnit).GetField("imports", BindingFlags.NonPublic | BindingFlags.Instance)!;
        public static void Add(TypeScriptUnit unit, ITypeInfo typeInfo, TypeScriptImportStatement typeScriptImportStatement)
        {
            var imports = importsField!.GetValue(unit) as Dictionary<ITypeInfo, TypeScriptImportStatement>;
            imports!.Add(typeInfo, new ImportSignalRStatement());
        }
    }
}