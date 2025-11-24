import {App,Dependency,Injection,Instance,Interface,Module} from "./Models.js"
import { ModuleRepo,InstanceRepo } from "./Repos.js";
import TemplatedHtml from "./TemplatedHtml.js";



class SidePanelManager{
    constructor(appInfoUI,moduleInfoUI){

    }
    changeToModule(module){
        
    }
    changeToInstance(instancee){
        
    }
    changeToApp(){

    }
}

class CreateInstanceForDependencyUseCase{
    constructor(instaceRepo,moduleRepo,moduleDisplay){
        this.instaceRepo = instaceRepo;
        this.moduleRepo = moduleRepo;
        this.moduleDisplay = moduleDisplay;
    }
    createInstance(injection,module){
        var newInstance = new Instance();
        newInstance.module = module;
        injection.instance = newInstance;
        this.moduleDisplay = moduleDisplay;
    }
}

class InjectionUI {
    constructor(injection,container,instanceRepo,moduleRepo,moduleSelectUi,createInstanceForInjectionUseCase){
        this.injection = injection;
        var ui = new TemplatedHtml("injection");
        container.append(ui);
        ui.setText("t-name",injection.name);
        ui.setValue("t-interface",injection.interface.name);
        ui.setValue("injectionId",injection.id);
        this.moduleRepo = moduleRepo;
        this.instanceRepo = instanceRepo;
        this.moduleSelectUi = moduleSelectUi;
        this.createInstanceForInjectionUseCase = createInstanceForInjectionUseCase;
    }

    instanceSelected(instanceId){
        var instance = this.instanceRepo.getById(instanceId);
        if(!instance){
            //err

            return false;
        }
        this.injection.instance = instance;
    }
    choose(){
        //choose selected instance on right
        var selectedInstance = this.moduleSelectUi.getSelected();
        if(!selectedInstance){
            //display not selected err.
            return;
        }
        this.selectedInstance(selectedInstance.id);
    }
    auto(){
        //find only instance with right interface
        var instances = this.instanceRepo.getByInterface(this.injection.interface);
        if(!instance){
            return false;
        }
        if(instances.length > 1){
            //more that one
            return false;
        }
        
        this.instanceSelected(instances);

    }
    createInstance(){
        //Open UI to choose a module pre-filtered to the interface.
        //choose module
        var chosenModule;
        this.createInstanceForInjectionUseCase.createInstance(this.injection,chosenModule);
    }
}

class InstanceUI{
    constructor(){

    }
    load(instance){
        //set name
        //set module
        //set interface
        //get dependencies in ui

    }
    open(){
        //not sure?
    }
}







var app = new App();
var instanceRepo = new InstanceRepo(app);
var moduleRepo = new ModuleRepo();

moduleRepo.loadModule("./Modules/HtmlContext.js");
moduleRepo.loadModule("./Modules/RootContainer.js");
moduleRepo.loadModule("./Modules/CenterLayout.js");
moduleRepo.loadModule("./Modules/AudioLoader.js");
moduleRepo.loadModule("./Modules/AudioController.js");
moduleRepo.loadModule("./Modules/PlayPauseControlUI.js");

moduleRepo.allowAllLoadedCall();

window.moduleRepo = moduleRepo;
console.log(moduleRepo);