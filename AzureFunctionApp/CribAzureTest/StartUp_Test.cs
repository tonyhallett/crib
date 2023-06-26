using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using CribAzureFunctionApp.Hub;
using CribAzureFunctionApp;

namespace CribAzureTest
{
    internal class StartUp_Test
    {
        [Test]
        public void Should_Have_Added_All_Services_For_DI()
        {
            var startup = new Startup();
            var host = new HostBuilder().ConfigureWebJobs(startup.Configure).Build();
            var ctor = typeof(CribHub).GetConstructors()[0];
            var ctorParameterTypes = ctor.GetParameters().Select(p => p.ParameterType);
            foreach(var ctorParameterType in ctorParameterTypes)
            {
                var o = host.Services.GetRequiredService(ctorParameterType);
            }
        }
    }
}
