import { AutoFillInjectionUseCase } from "./UseCases/AutoFillInjectionUseCase.js";
import { SetInjectionToInstanceUseCase } from "./UseCases/SetInjectionToInstanceUseCase.js";
import { SaveInstanceUseCase } from "./UseCases/SaveInstanceUseCase.js";
import { DeleteInstanceUseCase } from "./UseCases/DeleteInstanceUseCase.js";
import { CreateInstanceUseCase } from "./UseCases/CreateInstanceUseCase.js";
import { GetInstancesForInterfaceUseCase } from "./UseCases/GetInstancesForInterfaceUseCase.js";
import { GetAllModulesUseCase } from "./UseCases/GetAllModulesUseCase.js";
import { AutoFillAllInjectionsUseCase } from "./UseCases/AutoFillAllInjectsUseCase.js";

import { App } from "./Models/App.js";
import { ModuleRepo } from "./Repos.js";

import { ModuleSelectUI } from "./UI/ModuleSelectUI.js";
import { InstanceChooser } from "./UI/InstanceChooser.js";
import { SidePanelManager } from "./UI/SidePanelManager.js";
import { InstancesDisplayUI } from "./UI/InstancesDisplayUI.js";
import { CreateInstanceControllerIsh } from "./Controllers/CreateInstanceControllerIsh.js";
import { InstanceController } from "./Controllers/InstanceController.js";
import { ModifyInstanceUI } from "./UI/ModifyInstanceUI.js";
import { GetAllInstancesUseCase } from "./UseCases/GetAllInstancesUseCase.js";
import { GetModulesForInterfaceUseCase } from "./UseCases/GetModulesForInterfaceUseCase.js";
import { InjectUIFactory } from "./UI/InjectUIFactory.js";
import { AutoFillInjectWithNewInstanceUseCase } from "./UseCases/AutoFillInjectWithNewInstanceUseCase.js";
import { AutoDependencyController } from "./Controllers/AutoDependencyController.js";
import { AppController } from "./Controllers/AppController.js";
import { ImportAppUseCase } from "./UseCases/ImportAppUseCase.js";
import { ResetAppUseCase } from "./UseCases/ResetAppUseCase.js";
import { ExportAppUseCase } from "./UseCases/ExportAppUseCase.js";
import { JSONDownloader } from "./UI/JSONDownloader.js";
import { AppUI } from "./UI/AppUI.js";
import { FileUploadUI } from "./UI/FileUploadUI.js";

//Dependency Injection Start


var app = new App();
export var moduleRepo = new ModuleRepo();


var saveInstanceUseCase = new SaveInstanceUseCase({ app });
var createInstanceUseCase = new CreateInstanceUseCase({ saveInstanceUseCase });
var deleteInstanceUseCase = new DeleteInstanceUseCase({ app });
var autoFillInjectionUseCase = new AutoFillInjectionUseCase({ app });
var setInjectionToInstanceUseCase = new SetInjectionToInstanceUseCase({ createInstanceUseCase });
var getAllModulesUseCase = new GetAllModulesUseCase({ moduleRepo });
var getAllInstancesUseCase = new GetAllInstancesUseCase({ app });
var getModulesForInterfaceUseCase = new GetModulesForInterfaceUseCase({ moduleRepo });
var deleteInstanceUseCase = new DeleteInstanceUseCase({ app });
var autoFillInjectWithNewInstanceUseCase = new AutoFillInjectWithNewInstanceUseCase({ moduleRepo, getModulesForInterfaceUseCase, createInstanceUseCase });
var autoFillAllInjectionsUseCase = new AutoFillAllInjectionsUseCase({ getAllInstancesUseCase, autoFillInjectionUseCase, autoFillInjectWithNewInstanceUseCase });

moduleRepo.loadModule("./Modules/HtmlContext.js");
moduleRepo.loadModule("./Modules/RootContainer.js");
moduleRepo.loadModule("./Modules/CenterLayout.js");
moduleRepo.loadModule("./Modules/AudioLoader.js");
moduleRepo.loadModule("./Modules/AudioController.js");
moduleRepo.loadModule("./Modules/PlayPauseControlUI.js");


var instanceChooser = new InstanceChooser({});
var instancesDisplayUI = new InstancesDisplayUI({ getAllInstancesUseCase, instanceChooser });
var chooseModuleUI = new ModuleSelectUI({});
var modifyInstanceUI = new ModifyInstanceUI({ saveInstanceUseCase, moduleRepo, chooseModuleUI });
var sidePanelManager = new SidePanelManager({
    appInfoElement: document.getElementById("appInfoPanel"),
    instanceInfoElement: document.getElementById("instanceInfoPanel")
});
var jSONDownloader = new JSONDownloader();
var appUI = new AppUI({app});



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
    createInstanceControllerIsh,
    instancesDisplayUI
});

var autoDependencyController = new AutoDependencyController({
    autoFillAllInjectionsUseCase,
    instancesDisplayUI,
    sidePanelManager
})


var importAppUseCase = new ImportAppUseCase({createInstanceUseCase,setInjectionToInstanceUseCase,moduleRepo,getAllInstancesUseCase});
var resetAppUseCase = new ResetAppUseCase({app});
var exportAppUseCase = new ExportAppUseCase({app});

var appController = new AppController({
    importAppUseCase,
    resetAppUseCase,
    exportAppUseCase,
    jSONDownloader,
    instancesDisplayUI,
    sidePanelManager,
    appUI
});


instanceChooser.instanceController = instanceController;

modifyInstanceUI.injectUIFactory = injectUIFactory
modifyInstanceUI.controller = instanceController;

createInstanceUseCase.instancesUI = instancesDisplayUI;
createInstanceUseCase.modifyInstanceUI = modifyInstanceUI;
createInstanceUseCase.sidePanelManager = sidePanelManager;
createInstanceUseCase.iInstanceController = instanceController;

saveInstanceUseCase.instancesDisplay = instancesDisplayUI;
saveInstanceUseCase.sidePanelManager = sidePanelManager;



//DI end

//Glue Start



sidePanelManager.changeToApp();

new FileUploadUI((fileName,content)=>{ appController.import(fileName,content); });

document.getElementById("export").addEventListener("click",()=>{appController.export();})

document.getElementById("addInstanceButton").addEventListener("click", () => { createInstanceControllerIsh.create(); });

document.getElementById("autoDependency").addEventListener("click", () => { autoDependencyController.all(); });

moduleRepo.allowAllLoadedCall();

var debug = () => {
    debugger;
}

document.getElementById("debugBreak").addEventListener("click", debug);