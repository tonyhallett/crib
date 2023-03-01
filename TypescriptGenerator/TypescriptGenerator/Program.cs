//using SkbKontur.TypeScript.ContractGenerator


using SkbKontur.TypeScript.ContractGenerator;

namespace TypescriptGenerator
{
    internal class Program
    {
        static void Main(string[] args)
        {
            TypeScriptGenerationOptions options = TypeScriptGenerationOptions.Default;
            // can now pass the path to the Assembly
            var typeGenerator = new SkbKontur.TypeScript.ContractGenerator.TypeScriptGenerator(options, new MyCustomTypeGenerator(), new MyRootTypesProvider());
            typeGenerator.GenerateFiles("C:\\Users\\tonyadmin\\Documents\\TempGeneratedFiles");
            //Tester.Test();
        }
    }
}