using Microsoft.Extensions.Options;
using SkbKontur.TypeScript.ContractGenerator;
using SkbKontur.TypeScript.ContractGenerator.Abstractions;
using SkbKontur.TypeScript.ContractGenerator.CodeDom;
using SkbKontur.TypeScript.ContractGenerator.Internals;
using System.Diagnostics;
using System.Reflection;

namespace TypescriptGenerator
{
    internal class Program
    {
        static void Main(string[] args)
        {
            var generatedTypescriptFilePath = args[1];
            var generatedFileName = Path.GetFileName(generatedTypescriptFilePath);
            var (typeScriptGenerator, unit, serverlessHubTypes) = 
                GenerateUnit(args[0] /* assembly path */, generatedFileName);

            AddConnectionCode(typeScriptGenerator, unit, serverlessHubTypes);

            GenerateFiles(typeScriptGenerator, generatedTypescriptFilePath);
        }

        private static void GenerateFiles(TypeScriptGenerator typeScriptGenerator, string generatedTypescriptFilePath)
        {
            // this is necessary as TypeScriptGenerator will clean the directory !
            var tempDirectory = IOHelpers.GetTemporaryDirectory();
            var tempDirectoryPath = tempDirectory.FullName;
            typeScriptGenerator.GenerateFiles(tempDirectoryPath);
            var generatedFile = tempDirectory.GetFiles()[0];
            File.Move(generatedFile.FullName, generatedTypescriptFilePath,true);
            tempDirectory.Delete();
        }

        private static (TypeScriptGenerator, TypeScriptUnit, List<ServerlessHubType>) GenerateUnit(string assemblyPath, string generatedFileName)
        {
            TypeScriptGenerationOptions options = new TypeScriptGenerationOptions
            {
                CustomContentMarker = "Generated from ServerlessHub<T>",
                NullabilityMode = NullabilityMode.None
            };
            var hubTypesProvider = new HubTypesProvider();
            var rootTypesProvider = new RootTypesProvider(
                assemblyPath,
                hubTypesProvider
            );
            var customTypeGenerator = new CustomTypeGenerator(rootTypesProvider, generatedFileName);
            var typeGenerator = new TypeScriptGenerator(
                options,
                customTypeGenerator,
                rootTypesProvider
            );
            
            var unit = typeGenerator.Generate()[0];
            return (typeGenerator, unit, hubTypesProvider.ServerlessHubs);
        }
    
        private static void AddConnectionCode(TypeScriptGenerator typeScriptGenerator,TypeScriptUnit unit,List<ServerlessHubType> serverlessHubTypes)
        {
            TypescriptUnitImports.Add(unit, SkbKontur.TypeScript.ContractGenerator.Internals.TypeInfo.From(typeof(Program)), new ImportSignalRStatement());

            unit.Body.Add(new ConnectionCode(typeScriptGenerator,unit, serverlessHubTypes));

        }
    }
}