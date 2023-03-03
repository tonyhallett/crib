//using SkbKontur.TypeScript.ContractGenerator


using Microsoft.Extensions.Options;
using SkbKontur.TypeScript.ContractGenerator;
using SkbKontur.TypeScript.ContractGenerator.Abstractions;
using SkbKontur.TypeScript.ContractGenerator.CodeDom;
using SkbKontur.TypeScript.ContractGenerator.Internals;
using System.Reflection;

namespace TypescriptGenerator
{
    internal class Program
    {
        static void Main(string[] args)
        {
            TypeScriptGenerationOptions options = new TypeScriptGenerationOptions
            {
                CustomContentMarker = "Generated from ServerlessHub<T>",
                NullabilityMode = NullabilityMode.None
            };
            var hubTypesProvider = new HubTypesProvider();
            //TODO both file paths from args
            var rootTypesProvider = new RootTypesProvider(
                @"C:\Users\tonyadmin\Documents\crib\AzureFunctionApp\AzureFunctionApp\bin\Debug\net6.0\AzureFunctionApp.dll",
                hubTypesProvider
            );
            var customTypeGenerator = new CustomTypeGenerator(rootTypesProvider,"index.ts");
            var typeGenerator = new TypeScriptGenerator(
                options,
                customTypeGenerator,
                rootTypesProvider
            );
            var unit = typeGenerator.Generate()[0];
            var importsField = unit.GetType().GetField("imports", System.Reflection.BindingFlags.NonPublic | BindingFlags.Instance);
            var imports = importsField!.GetValue(unit) as Dictionary<ITypeInfo, TypeScriptImportStatement>;
            imports!.Add(SkbKontur.TypeScript.ContractGenerator.Internals.TypeInfo.From(typeof(Program)), new ImportSignalRStatement());

            unit.Body.Add(new ConnectionCode(hubTypesProvider.ServerlessHubs));
            
            typeGenerator.GenerateFiles("C:\\Users\\tonyadmin\\Documents\\TempGeneratedFiles");
        }
    }
}