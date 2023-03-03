using SkbKontur.TypeScript.ContractGenerator.CodeDom;

namespace TypescriptGenerator
{
    public class ConnectionCode : TypeScriptStatement
    {
        private readonly List<ServerlessHubType> serverlessHubs;

        public ConnectionCode(List<ServerlessHubType> serverlessHubs) {
            this.serverlessHubs = serverlessHubs;
        }

        public override string GenerateCode(ICodeGenerationContext context)
        {
            /*
                I will need to considerMessage Pack format
            */
  
            return @$"  
                //todo {serverlessHubs[0].HubInfo.Name}
            ";
        }
    }

}
