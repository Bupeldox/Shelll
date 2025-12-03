

function generateModuleDefinition(classString) {
    // Regex to capture the class name
    const classNameRegex = /export\s+class\s+(\w+)/;
    const classNameMatch = classString.match(classNameRegex);

    if (!classNameMatch) {
        throw new Error("Invalid class string provided.");
    }

    const tclassName = classNameMatch[1]; // Class name

    // Regex to capture constructor dependencies
    const constructorRegex = /constructor\s*\(\{([^\}]*)\}\)/;
    const constructorMatch = classString.match(constructorRegex);

    if (!constructorMatch) {
        throw new Error("Constructor not found.");
    }
    const dependenciesRaw = constructorMatch[1].trim(); // Constructor dependencies


    
    // Extract dependencies from the constructor
    const dependencies = dependenciesRaw.split(',').map(dep => {
        const depName = dep.split(':')[0].trim();
        return `{ name: "${depName}", interface: { name: "I${depName.charAt(0).toUpperCase() + depName.slice(1)}V0" } }`;
    });

    var moduledef = `
export default{
    Dependencies: [${dependencies}],
    Interface: {
        name: "I${tclassName}V0",
    },
    module: ${tclassName},
    name: "${tclassName}"
}
`
    

    return moduledef;
}

function unExportClass(content){
    return content.replace("export class","class");
}

if (require.main === module) {
    const fs = require("node:fs");
    const path = require("path");
    var fileDir = process.argv[2];
    var content = fs.readFileSync(path.resolve(__dirname,fileDir)).toString();
    var moduleDef = generateModuleDefinition(content);
    var moduleUnExported = unExportClass(content);
    var newFileContent = moduleUnExported + "\n\n" + moduleDef;
    fs.writeFileSync(path.resolve(__dirname,fileDir.replace(".js",".shellmod.js")),newFileContent);
   
} else {
    module = {generateModuleDefinition};
}
