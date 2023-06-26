//using SkbKontur.TypeScript.ContractGenerator


using SkbKontur.TypeScript.ContractGenerator.CodeDom;

namespace TypescriptGenerator
{
    public class ImportSignalRStatement : TypeScriptImportStatement
    {
        public override string GenerateCode(ICodeGenerationContext context)
        {
            return "import * as signalR from '@microsoft/signalr';";
        }
    }
}