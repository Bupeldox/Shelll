import { AutoFillInjectionUseCase } from "./UseCases/AutoFillInjectionUseCase.js";
import { SetInjectionToInstanceUseCase } from "./UseCases/SetInjectionToInstanceUseCase.js";
import { SaveInstanceUseCase } from "./UseCases/SaveInstanceUseCase.js";
import { DeleteInstanceUseCase } from "./UseCases/DeleteInstanceUseCase.js";
import { CreateInstanceUseCase } from "./UseCases/CreateInstanceUseCase.js";
import { GetInstancesForInterfaceUseCase } from "./UseCases/GetInstancesForInterfaceUseCase.js";
import { GetAllModulesUseCase } from "./UseCases/GetAllModulesUseCase.js";

import { App, Dependency, Injection, Instance, Interface, Module} from "./Models.js"
import { ModuleRepo } from "./Repos.js";

import { ModuleSelectUI } from "./UI/ModuleSelectUI.js";
import { InstanceChooser } from "./UI/InstanceChooser.js";
import { SidePanelManager } from "./UI/SidePanelManager.js";
import { InstancesDisplayUI } from "./UI/InstancesDisplayUI.js";
import { CreateInstanceControllerIsh } from "./Controllers/CreateInstanceControllerIsh.js";
import { InjectionController } from "./Controllers/InjectionController.js";
import { InstanceController } from "./Controllers/InstanceController.js";
import { ModifyInstanceUI } from "./UI/ModifyInstanceUI.js";
import { InjectionUI } from "./UI/InjectionUI.js";
import { GetAllInstancesUseCase } from "./UseCases/GetAllInstancesUseCase.js";
import { GetModulesForInterfaceUseCase } from "./UseCases/GetModulesForInterfaceUseCase.js";


class InjectUIFactory{
    constructor({
        instanceChooser,
        autoFillInjectionUseCase,
        createInstanceControllerIsh
    }){
        
        this.autoFillInjectionUseCase = autoFillInjectionUseCase;
        this.instanceChooser = instanceChooser;
        this.createInstanceControllerIsh = createInstanceControllerIsh;
    }
    createUI(injection,container){
        var controller = new InjectionController({
            injection,
            injectionUI,
            instanceChooser:this.instanceChooser,
            autoFillInjectionUseCase:this.autoFillInjectionUseCase,
            createInstanceControllerIsh: this.createInstanceControllerIsh,
            instancesDisplayUI
        });

        var injectionUI = new InjectionUI({
            injection,//should probs be a viewmodel
            container,
            controller
        });

        controller.injectionUI = injectionUI;

        return injectionUI;
    }
}


//Definition End




//Dependency Injection Start


var app = new App();
var moduleRepo = new ModuleRepo();


var saveInstanceUseCase = new SaveInstanceUseCase({app});
var createInstanceUseCase = new CreateInstanceUseCase({saveInstanceUseCase});
var deleteInstanceUseCase = new DeleteInstanceUseCase({app});
var autoFillInjectionUseCase = new AutoFillInjectionUseCase({app});
var setInjectionToInstanceUseCase = new SetInjectionToInstanceUseCase({createInstanceUseCase});
var getAllModulesUseCase = new GetAllModulesUseCase({moduleRepo});
var getAllInstancesUseCase  = new GetAllInstancesUseCase({app});
var getModulesForInterfaceUseCase = new GetModulesForInterfaceUseCase({moduleRepo});
var deleteInstanceUseCase = new DeleteInstanceUseCase({app});

moduleRepo.loadModule("./Modules/HtmlContext.js");
moduleRepo.loadModule("./Modules/RootContainer.js");
moduleRepo.loadModule("./Modules/CenterLayout.js");
moduleRepo.loadModule("./Modules/AudioLoader.js");
moduleRepo.loadModule("./Modules/AudioController.js");
moduleRepo.loadModule("./Modules/PlayPauseControlUI.js");


var instanceChooser = new InstanceChooser({});
var instancesDisplayUI = new InstancesDisplayUI({getAllInstancesUseCase ,instanceChooser});
var chooseModuleUI = new ModuleSelectUI({});
var modifyInstanceUI = new ModifyInstanceUI({saveInstanceUseCase, moduleRepo,chooseModuleUI});
var sidePanelManager = new SidePanelManager({
    appInfoElement:document.getElementById("appInfoPanel"),
    instanceInfoElement:document.getElementById("instanceInfoPanel")
});





modifyInstanceUI.instanceChooser = instanceChooser;
instancesDisplayUI.instanceChooser = instanceChooser;

var instanceController = new InstanceController({
    deleteInstanceUseCase,
    modifyInstanceUI,
    sidePanelManager,
    moduleRepo,
    instancesDisplayUI,
    saveInstanceUseCase
});

var createInstanceControllerIsh = new CreateInstanceControllerIsh({
    chooseModuleUI,
    instanceController,
    getModulesForInterfaceUseCase,
    getAllModulesUseCase,
    createInstanceUseCase,
    setInjectionToInstanceUseCase,
    instancesDisplayUI
});

var injectUIFactory = new InjectUIFactory({
    instanceChooser,
    autoFillInjectionUseCase,
    createInstanceControllerIsh
});


instanceChooser.instanceController = instanceController;

modifyInstanceUI.injectUIFactory = injectUIFactory
modifyInstanceUI.controller = instanceController;

createInstanceUseCase.instancesUI = instancesDisplayUI;
createInstanceUseCase.modifyInstanceUI = modifyInstanceUI;
createInstanceUseCase.sidePanelManager = sidePanelManager;
createInstanceUseCase.iInstanceController = instanceController;

saveInstanceUseCase.instancesDisplay = instancesDisplayUI ;
saveInstanceUseCase.sidePanelManager = sidePanelManager;



//DI end

//Glue Start



sidePanelManager.changeToApp();


document.getElementById("addInstanceButton").addEventListener("click",()=>{
    createInstanceControllerIsh.create();
})

moduleRepo.registerOnAllLoaded(()=>{
    (()=>{
        let rootMod = moduleRepo.getByName("RootElement");
        createInstanceUseCase.execute(rootMod);
    })();

    (()=>{
        let docMod = moduleRepo.getByName("Html Document");
        createInstanceUseCase.execute(docMod);
    })();

    var instance = createInstanceUseCase.execute(moduleRepo.getByName("CenterLayout"))
    instancesDisplayUI.update();
    instanceController.edit(instance);


});

moduleRepo.allowAllLoadedCall();

var debug = ()=>{
    debugger;
}
document.getElementById("debugBreak").addEventListener("click",debug);