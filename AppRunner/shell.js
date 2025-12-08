import { moduleRepo } from "../ModuleRepo.js";

class InjectDependencyUseCase{
    execute(targetInstance,dependencyInstance,targetProperty){
        targetInstance[targetProperty] = dependencyInstance;
        targetInstance.onDependencySet?.();
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

        for(var i in instanceMap){
            instanceMap[i].onGraphComplete?.();
        }
    }
}


try{
    let injectDependencyUseCase = new InjectDependencyUseCase();
    let appLoader = new AppGraphLoader({moduleRepo,injectDependencyUseCase});


    window.appLoader = appLoader;

    var preLoad = new URLSearchParams(new URL(window.location.href).search).get("o");
    import("/User/AppConfigs/"+preLoad, { with: { type: "json" } }).then(d=>{
        moduleRepo.registerOnAllLoaded(()=>{
            appLoader.load(d.default);
        })    
    });
}
catch(ex){
    document.getElementById("errorOut").innerHTML= JSON.stringify(ex,null,3).replaceAll("\n","<br/>");
}