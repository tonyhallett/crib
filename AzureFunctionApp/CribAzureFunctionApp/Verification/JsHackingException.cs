#nullable enable

using System;

namespace CribAzureFunctionApp.Verification
{
    public class JsHackingException : Exception
    {
        public JsHackingException(string message) : base(message) { }
    }

}