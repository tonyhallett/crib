const exec = require('child_process').execFile;
const path = require("path");

const getPath = function(relativePath){
    return path.join(__dirname, relativePath);
}

const generateTypes = function(){
    const exePath = getPath("..\\TypescriptGenerator\\TypescriptGenerator\\bin\\Debug\\net6.0\\TypescriptGenerator.exe");
    const outputFile = getPath("..\\src\\generatedTypes.ts");
    const assemblyPath = getPath("..\\AzureFunctionApp\\AzureFunctionApp\\bin\\Debug\\net6.0\\AzureFunctionApp.dll");

    exec(exePath, [assemblyPath, outputFile], function(err, data) {  
        if(err){
            console.log(err)
        }else{
            console.log("Generated types");
        }
    });  
}
generateTypes();