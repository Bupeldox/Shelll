import { Module } from "../AppEditor/Models/Module.js";

class ModuleRepo {
    constructor() {
        this.modules = [];
        
        this._notLoaded = {};
        this._allowAllLoadedCall = false;
        this.onAllLoadedCall = [];
    }
    getByInterfaceName(interfaceName){
        return this.modules.filter(i=>i.interface.name == interfaceName);
    }
    loadModule(src) {
        
        this._notLoaded[src] = 1;
        import(src).then(m => {
            try{

                m = m.default;
                m.src = src;
                
                if (this.modules.some(i => i.name == m.name)) {
                    return;
                }
                
                var module = new Module();
                module.name = m.name;
                module.dependencies = m.Dependencies;
                module.interface = m.Interface;
                module.module = m.module;
                
                this.modules.push(module);
                
            }catch{
                
            }

            delete this._notLoaded[src];
                
            this._onLoad()
        });
    }
    allowAllLoadedCall(){
        
        this._allowAllLoadedCall = true;
        this._onLoad();
    }
    registerOnAllLoaded(func){
        this.onAllLoadedCall.push(func);
        this._onLoad();
    }
    getAll(){
        return this.modules;
    }
    _onLoad(){
        if(!this._allowAllLoadedCall){
            return;
        }
        var modulesNotLoaded = Object.keys(this._notLoaded);
        if(modulesNotLoaded.length != 0){
            return;
        }
        this.onAllLoadedCall.map(i=>i());
        this.onAllLoadedCall = [];
    }
    getByName(name){
        return this.modules.find(i=>i.name == name);
    }
}

export const moduleRepo = new ModuleRepo();

fetch("/inDir/Modules").then(r=>r.json()).then(dirs=>{
    dirs.map(fileName=>{
        var url = "/User/Modules/"+fileName
        moduleRepo.loadModule(url);
    });
    moduleRepo.allowAllLoadedCall();
});



window.moduleRepo = moduleRepo;