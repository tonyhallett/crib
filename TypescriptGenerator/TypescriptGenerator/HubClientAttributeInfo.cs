using SkbKontur.TypeScript.ContractGenerator.Abstractions;
using TheirIAttributeInfo = SkbKontur.TypeScript.ContractGenerator.Abstractions.IAttributeInfo;

namespace TypescriptGenerator
{
    public class HubClientAttributeInfo : IAttributeInfo
    {
        public ITypeInfo AttributeType => throw new NotImplementedException();

        public Dictionary<string, object?> AttributeData => new Dictionary<string, object?>();
        public static TheirIAttributeInfo Instance = new HubClientAttributeInfo();
    }

}
