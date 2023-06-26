using SkbKontur.TypeScript.ContractGenerator.Abstractions;

namespace TypescriptGenerator
{
    public interface IHubClientTypeProvider
    {
        bool IsHubClientType(ITypeInfo typeInfo);
    }

}
