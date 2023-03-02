//using SkbKontur.TypeScript.ContractGenerator


using SkbKontur.TypeScript.ContractGenerator;

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
            //var connectionCodeManager = new ConnectionCodeManager(new ConnectionCodeFactory());
            //TODO both file paths from args
            var rootTypesProvider = new RootTypesProvider(
                @"C:\Users\tonyadmin\Documents\crib\AzureFunctionApp\AzureFunctionApp\bin\Debug\net6.0\AzureFunctionApp.dll",
                hubTypesProvider
            );
            var outputFileName = "index.ts";
            var customTypeGenerator = new CustomTypeGenerator().WithTypeLocationRule(typeInfo => true, typeInfo => outputFileName);
            // can go for simplest generator
            var typeGenerator = new TypeScriptGenerator(
                options,
                customTypeGenerator,
                rootTypesProvider
            );
            typeGenerator.GenerateFiles("C:\\Users\\tonyadmin\\Documents\\TempGeneratedFiles");
            // just open the only generated file and then write what I need !
            // Only issue with this is ensuring that I have the sa,e typescript type names

        }
    }
}