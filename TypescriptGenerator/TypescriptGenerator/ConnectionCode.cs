using SkbKontur.TypeScript.ContractGenerator.CodeDom;

namespace TypescriptGenerator
{
    public class ConnectionCode : TypeScriptStatement
    {
        private readonly string hubClientTypeName;

        // could also provide the unit so can add the import
        public ConnectionCode(string hubClientTypeName) {
            this.hubClientTypeName = hubClientTypeName;
        }

        public override string GenerateCode(ICodeGenerationContext context)
        {
            /*
                I will need to considerMessage Pack format
            */
  
            return @$"  

            ";
        }
    }

}
