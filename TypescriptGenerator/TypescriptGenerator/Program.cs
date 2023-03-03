//using SkbKontur.TypeScript.ContractGenerator


using Microsoft.Extensions.Options;
using SkbKontur.TypeScript.ContractGenerator;
using SkbKontur.TypeScript.ContractGenerator.Abstractions;
using SkbKontur.TypeScript.ContractGenerator.CodeDom;
using SkbKontur.TypeScript.ContractGenerator.Internals;

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
            // hacky
            var imports = unit.Imports as Dictionary<ITypeInfo, TypeScriptImportStatement>;
            imports!.Add(TypeInfo.From(typeof(Program)), new ImportSignalRStatement());

            unit.Body.Add(new ConnectionCode(hubTypesProvider.ServerlessHubs));
            
            typeGenerator.GenerateFiles("C:\\Users\\tonyadmin\\Documents\\TempGeneratedFiles");
        }
    }
    public class ImportSignalRStatement : TypeScriptImportStatement
    {
        public override string GenerateCode(ICodeGenerationContext context)
        {
            return "import * as signalR from @microsoft/signalr;";
        }
    }
}