import { ModuleRepo } from "../ModuleRepo.js";

class InjectDependencyUseCase{
    execute(targetInstance,dependencyInstance,targetProperty){
        targetInstance[targetProperty] = dependencyInstance;
        targetInstance.onDependencySet();
    }
}

class AppGraphLoader{
    constructor({moduleRepo,injectDependencyUseCase}){
        this.moduleRepo = moduleRepo;
        this.injectDependencyUseCase = injectDependencyUseCase;
    }
    load(jsonGraph){
        var instanceMap = {};
        jsonGraph.nodes.map(i=>{
            var type = this.moduleRepo.getByName(i.typeName);
            instanceMap[i.name] = new type.module({});
        });

        jsonGraph.edges.map(e=>{
            var target = instanceMap[e.fromName];//has the property
            var source = instanceMap[e.toName];
            this.injectDependencyUseCase.execute(target,source,e.fromProperty);
        });
    }
}


try{
    let moduleRepo = new ModuleRepo();
    let injectDependencyUseCase = new InjectDependencyUseCase();
    let appLoader = new AppGraphLoader({moduleRepo,injectDependencyUseCase});



    moduleRepo.loadModule("/User/Modules/HtmlContext.js");
    moduleRepo.loadModule("/User/Modules/RootContainer.js");
    moduleRepo.loadModule("/User/Modules/CenterLayout.js");
    moduleRepo.loadModule("/User/Modules/AudioLoader.js");
    moduleRepo.loadModule("/User/Modules/AudioController.js");
    moduleRepo.loadModule("/User/Modules/PlayPauseControlUI.js");

    moduleRepo.allowAllLoadedCall();

    window.appLoader = appLoader;

    import("/User/AppConfigs/FakePhoneCallsPlayer.json", { with: { type: "json" } }).then(d=>{
        moduleRepo.registerOnAllLoaded(()=>{
            appLoader.load(d.default);
        })    
    });
}
catch(ex){
    document.getElementById("errorOut").innerHTML= JSON.stringify(ex,null,3).replaceAll("\n","<br/>");
}