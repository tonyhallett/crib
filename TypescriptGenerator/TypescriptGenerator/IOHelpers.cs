//using SkbKontur.TypeScript.ContractGenerator

namespace TypescriptGenerator
{
    public static class IOHelpers
    {
        public static DirectoryInfo GetTemporaryDirectory()
        {
            string tempDirectory = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());
            return Directory.CreateDirectory(tempDirectory);
        }
    }
}