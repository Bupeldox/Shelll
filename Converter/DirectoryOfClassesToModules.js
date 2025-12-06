const sourceDir = "/home/test/Desktop/Projects/Shelll/AppEditor";
const destDir = "/home/test/Desktop/Projects/Shelll/User/Modules/AppEditorModulesTest";

const { classFileToModuleFile } = require("./ClassToModule.js");



const fs = require("node:fs");
const path = require("path");



var filesInDir = fs.readdirSync(sourceDir,{recursive:true});

filesInDir.map(i=>{
    try{
        classFileToModuleFile(path.resolve(sourceDir,i),path.resolve(destDir,i));
    }catch{

    }
    console.log("done",i);
});