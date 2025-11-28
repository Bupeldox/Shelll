
class ModuleRepoDisplay {
    constructor({ container, graphController }) {
        this.container = container;
        this.graphController = graphController;
    }
    add(module) {
        let el = document.createElement("div");
        el.textContent = module.name;
        let button = document.createElement("button");
        button.textContent = "Add";
        button.addEventListener("click", () => {
            //let instance = prompt("What should this " + module.name + " be called? leave blank for random.");
            //if (!instance) {
            //}
            let instanceName = module.name + "-" + Math.random();
            this.graphController.addModule(module, instanceName);
        });
        el.appendChild(button);
        this.container.appendChild(el);
    }
}

class ModuleTypeRepo {
    constructor({ moduleListDisplay }) {
        this.modules = [];
        this.moduleListDisplay = moduleListDisplay;
        
        this._notLoaded = {};
        this._allowAllLoadedCall = false;
        this.onAllLoadedCall = [];
    }
    loadModule(src) {
        this._notLoaded[src] = 1;
        import(src).then(m => {
            m = m.default;
            m.src = src;
            
            if (this.modules.some(i => i.name == m.name)) {
                return;
            }
            this.modules.push(m);
            this.moduleListDisplay?.add(m);
            
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
    _onLoad(){
        if(!this.allowAllLoadedCall){
            return;
        }
        if(Object.keys(this._notLoaded).length != 0){
            return;
        }
        this.onAllLoadedCall.map(i=>i());
        this.onAllLoadedCall = [];
    }
    getByName(name){
        return this.modules.find(i=>i.name == name);
    }
}


class GraphDisplay {
    constructor({ container, graphController, moduleInstanceRepo }) {
        this.container = container;
        this.graphController = graphController;
        this.moduleInstanceRepo = moduleInstanceRepo;
    }
    add({ type, instanceName, instanceController }) {
        let el = document.createElement("div");
        el.style = "padding:0.5rem; margin:0.5rem; border:1px solid";

        el.textContent = type.name + " - " + instanceName;
        el.appendChild(document.createElement("br"));
        let propertyInputs = {};
        for (let dep in type.Dependencies) {
            let d = type.Dependencies[dep];
            let depContainer = document.createElement("div");

            let depName = document.createElement("u");
            depName.textContent = dep;
            depContainer.appendChild(depName);

            let funEl = document.createElement("span");
            funEl.textContent = " "+ d.map(i=>i.name).join(", ");
            depContainer.appendChild(funEl);
            depContainer.appendChild(document.createElement("br"));
            let dependencySetElement = document.createElement("input");
            dependencySetElement.addEventListener("input",()=>{
                instanceController.SetDependency(dep,dependencySetElement.value);
            });
            propertyInputs[dep] = dependencySetElement;
            depContainer.appendChild(dependencySetElement);

            el.appendChild(depContainer);
        }
        this.container.appendChild(el);
        return {
            updateDependency:(property,value)=>{
                propertyInputs[property].value = value;
            }
        };
    }

    setDependencyOptions(){

    }

}


class ModuleInstanceRepo{
    constructor(){
        this.modules = [];
    }
    add({ instance, type, instanceName }){
        this.modules.push({ instance, type, instanceName });
    }
    getInstanceByName(instanceName){
        return this.modules.find(i=>i.instanceName == instanceName)?.instance;
    }
    static DoMembersMatch(m1,m2){
        return m1.name == m2.name &&
            (
                (!m1.returns && !m2.returns) ||
                (m1.returns && m2.returns && m1.returns.every(fp=>m2.returns.includes(fp)))
            ) &&
            (
                (!m1.params && !m2.params) ||
                (m1.params && m2.params && m1.params.every(fp=>m2.params.includes(fp)))
            ) &&
            m1.prop == m2.prop &&
            m1.type == m2.type
    }
    getOptionForProperty(dependencyFuncs){

        return this.modules
        .filter(p=>this.CanTypeBeUseAsDependency(dependencyFuncs,p.type.Interface))
        .map(i=>i.instanceName);
    }

    CanTypeBeUseAsDependency(dependencyFuncs,interfaceFuncs){
        if(!dependencyFuncs || !interfaceFuncs){
            return false;
        }
        return dependencyFuncs
            .every(df=>interfaceFuncs
                .some(inf=>
                    ModuleInstanceRepo.DoMembersMatch(df,inf)
            )
        )
    }
}



class InstanceController{
    constructor({name,type,instance,instanceRepo,display,appGraphRepo}){
        this.instanceRepo = instanceRepo;
        this.name = name;
        this.type = type;
        this.instance = instance;
        this.display = display;
        this.appGraphRepo = appGraphRepo;
    }
    SetDependency(property,setToInstanceName){
        let instance = this.instance;
        let setToInstance = this.instanceRepo.getInstanceByName(setToInstanceName);
        instance[property] = setToInstance;
        instance.onDependencySet();
        this.appGraphRepo.addEdge(this.name,property,setToInstanceName);
        this.display.updateDependency(property,setToInstanceName);
    }
}

class GraphController {
    constructor({ graphDisplay, moduleInstanceRepo,appGraphRepo }) {
        this.graphDisplay = graphDisplay;
        this.moduleInstanceRepo = moduleInstanceRepo;
        this.appGraphRepo = appGraphRepo
    }
    validName(name) {
        return name && !this.moduleInstanceRepo.getInstanceByName(name);
    }
    addModule(type, instanceName,autoLink) {
        let instance = new type.module();
        let instanceController = new InstanceController({name:instanceName,type,instance,instanceRepo:this.moduleInstanceRepo,appGraphRepo:this.appGraphRepo});
        let display = this.graphDisplay.add({ instance, type, instanceName,instanceController });
        instanceController.display = display;
        this.moduleInstanceRepo.add({ instance, type, instanceName });
        this.appGraphRepo.addNode(instanceName,type);
        if(!autoLink){return instanceController;}
        for(let dependencyName in type.Dependencies){
            let funcList = type.Dependencies[dependencyName];
            let potentials = this.moduleInstanceRepo.getOptionForProperty(funcList);
            if(potentials.length != 1){continue;}
            let validInjection = potentials[0];
            instanceController.SetDependency(dependencyName,validInjection);
        };
        return instanceController;
    }
}

class AppGraphRepo{
    constructor(){
        this.nodes = [];
        this.edges = [];
    }
    addNode(name,type){
        //var copy = Object.assign({},type);
       // delete copy.module
        this.nodes.push({name,typeName:type.name});
    }
    addEdge(fromName,fromProperty,toName){
        this.edges.push({fromName,fromProperty,toName});
    }
    export(){
        return JSON.stringify(this);
    }
}

class AppGraphLoader{
    constructor({graphController,typeRepo}){
        this.typerepo = typeRepo;
        this.graphController = graphController;
    }
    load(jsonGraph){
        jsonGraph.nodes.map(i=>{
            var type = this.typerepo.getByName(i.typeName);
            i.instanceController = this.graphController.addModule(type,i.name,false);
        });

        jsonGraph.edges.map(e=>{
            var node = jsonGraph.nodes.find(i=>i.name == e.fromName);
            node.instanceController.SetDependency(e.fromProperty,e.toName);
        });

    }
}

try{
    let appGraphRepo = new AppGraphRepo();
    let moduleRepo = new ModuleTypeRepo({});
    let moduleInstanceRepo = new ModuleInstanceRepo();

    let graphController = new GraphController({moduleInstanceRepo,appGraphRepo});

    let moduleRepoDisplay = new ModuleRepoDisplay({ container: document.getElementById("availableModules"), graphController });
    let graphDisplay = new GraphDisplay({ container: document.getElementById("graphContainer"), graphController });

    graphController.graphDisplay = graphDisplay;
    moduleRepo.moduleListDisplay = moduleRepoDisplay;


    moduleRepo.loadModule("./Modules/HtmlContext.js");
    moduleRepo.loadModule("./Modules/RootContainer.js");
    moduleRepo.loadModule("./Modules/CenterLayout.js");

    moduleRepo.loadModule("./Modules/AudioLoader.js");
    moduleRepo.loadModule("./Modules/AudioController.js");
    moduleRepo.loadModule("./Modules/PlayPauseControlUI.js");
    moduleRepo.allowAllLoadedCall();

    window.a = appGraphRepo;



    let appGraphLoader = new AppGraphLoader({graphController,typeRepo:moduleRepo})


    import("./AppConfigs/FakePhoneCallsPlayer.json", { with: { type: "json" } }).then(d=>{
        moduleRepo.registerOnAllLoaded(()=>{
            appGraphLoader.load(d.default);
        })    
    })
}
catch(ex){
    document.getElementById("errorOut").innerHTML= JSON.stringify(ex,null,3).replaceAll("\n","<br/>");
}