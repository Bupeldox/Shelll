import { AutoFillInjectionUseCase } from "./UseCases/AutoFillInjectionUseCase.js";
import { CreateInstanceForInjectionUseCase, SetInjectionToInstanceUseCase } from "./UseCases/SetInjectionToInstanceUseCase.js";
import { SaveInstanceUseCase } from "./UseCases/SaveInstanceUseCase.js";
import { DeleteInstanceUseCase } from "./UseCases/DeleteInstanceUseCase.js";
import { CreateInstanceUseCase } from "./UseCases/CreateInstanceUseCase.js";
import { GetInstancesForInterface } from "./UseCases/GetInstancesForInterface.js"

import { App, Dependency, Injection, Instance, Interface, Module} from "./Models.js"
import { ModuleRepo } from "./Repos.js";
import TemplatedHtml from "./TemplatedHtml.js";
import { InstanceChooser, ModuleSelectUI, SidePanelManager, SmallInstanceDisplay } from "./UIIDontWantTOMessWIth.js";


class InjectionUI {
    constructor({
        injection,
        container,
        controller,
    }){
        var ui = new TemplatedHtml("injection");
        container.append(ui.element);
        
        this.ui = ui;
        this.injection = injection;
        this.controller = controller;
        
        ui.setText("t-name",injection.dependency.name);
        ui.setText("t-interface",injection.dependency.interface?.name??"No interface");
        ui.setValue("injectionId",injection.id);
        
        ui.getElement("injectionChoose").addEventListener("click",()=>{this.controller.chooseInstance()});
        ui.getElement("injectionAuto").addEventListener("click",()=>{  this.controller.autoChooseInject()});
        ui.getElement("injectionCreate").addEventListener("click",()=>{this.controller.createInstanceForInject()});
        ui.getElement("removeCurrentInstance").addEventListener("click",()=>{this.controller.removeInstance()});
        
        this.updateInstanceDisplay();
    }
    destroy(){
        this.ui.element.remove();
    }
    updateInstanceDisplay(){
        if(this.injection.instance){
            this.ui.getElement("chosenInstance").style.display = "";
            this.ui.getElement("instanceChoosing").style.display = "none";
            if(!this.instanceUI){
                this.instanceUI = new SmallInstanceDisplay(this.injection.instance);
                this.instanceUI.appendTo(this.ui.getElement("chosenInstanceContainer"));
            }else{
                this.instanceUI.update(this.injection.instance);
            }
        }else{
            this.ui.getElement("chosenInstance").style.display = "none";
            this.ui.getElement("instanceChoosing").style.display = "";
            if(this.controller.canBeAutoFilled()){
                this.ui.getElement("injectionChoose").style.display = "none";
                this.ui.getElement("injectionAuto").style.display = "";
            }else{
                this.ui.getElement("injectionChoose").style.display = "";
                this.ui.getElement("injectionAuto").style.display = "none";
            }
        }
    }
}


class InstancesDisplayUI{
    constructor({getAllInstancesUseCase,instanceChooser}){
        
        this.getAllInstancesUseCase = getAllInstancesUseCase;
        this.instanceChooser = instanceChooser;
        this.container = document.getElementById("instancesDisplay");
        this.UIMap = new Map();
    }
    update(){
        var instances = this.getAllInstancesUseCase.execute();

        instances.map(i=>{
            if(!this.UIMap.has(i)){
                let item = new SmallInstanceDisplay(i);
                item.prependTo(this.container);
                item.element.addEventListener("click",()=>{
                    instanceChooser.pick(i);
                });
                this.UIMap.set(i,item);
            }
        });

        for(let [key,value] of this.UIMap){
            if(!instances.some(i=>i.name == key.name)){
                var item = this.UIMap.get(key);
                item.destroy();
                this.UIMap.delete(key);
            }
        }
    }
}

class CreateInsanceControllerIsh{
    /**
     * @constructor
     * @param {Object} param0
     * @param {InstanceController} param0.instanceController 
     * @param {ChooseModuleUI} param0.chooseModuleUI 
     * @param {GetInstancesForInterfaceUseCase} param0.getInstancesForInterfaceUseCase 
     * @param {GetAllModulesUseCase} param0.getAllModulesUseCase 
     * @param {CreateInstanceUseCase} param0.setInjectionToInstanceUseCase 
     * @param {SetInjectionToInstanceUseCase} param0.setInjectionToInstanceUseCase 
    */ 
    constructor({
        instanceController,
        chooseModuleUI,
        getInstancesForInterfaceUseCase,
        getAllModuelesUseCase,
        createInstanceUseCase,
        setInjectionToInstanceUseCase
    }){ 
        this.instanceController = instanceController;
        this.chooseModuleUI = chooseModuleUI;
        this.getInstancesForInterfaceUseCase = getInstancesForInterfaceUseCase;
        this.getAllModuelesUseCase = getAllModuelesUseCase;
        this.createInstanceUseCase = createInstanceUseCase;
        this.setInjectionToInstanceUseCase = setInjectionToInstanceUseCase;
    }
    createForInjection(injection){
        var modules = this.getInstancesForInterfaceUseCase.execute(injection.interface);
        this.chooseModuleUI.setAvailableModules(modules);
        this.chooseModuleUI.open((module)=>{
            var instance = this.createInstanceUseCase.execute(module);
            this.setInjectionToInstanceUseCase.execute(injection,instance);
            this._showEditFor(instance);
        });
    }
    create(){
        var modules = this.getAllModuelesUseCase.execute();
        this.chooseModuleUI.setAvailableModules(modules);
        this.chooseModuleUI.open((module)=>{
            var instance = this.createInstanceUseCase.execute(module);
            this._showEditFor(instance);
        });
    }
    _showEditFor(instance){
        this.instanceController.edit(instance);
    }
    

}

class InjectionController{

    /**
     * @constructor
     * @param {Object} param0
     * @param {Injection} param0.injection
     * @param {InjectionUI} param0.injectionUI
     * @param {InstanceChooser} param0.instanceChooser
     * @param {AutoFillInjectionUseCase} param0.autoFillInjectionUseCase
     * @param {CreateInstanceControllerIsh} param0.createInsanceControllerIsh
     */
    constructor({
        injection,
        injectionUI,
        instanceChooser,
        autoFillInjectionUseCase,
        createInsanceControllerIsh
    }){
        this.injection = injection;
        this.autoFillInjectionUseCase = autoFillInjectionUseCase;
        this.injectionUI = injectionUI;
        this.instanceChooser = instanceChooser;
        this.createInsanceControllerIsh = createInsanceControllerIsh
    }
    chooseInstance(){
        this.instanceChooser.registerOnPick((i)=>{this._onInstancePicked(i)});
    }
    _onInstancePicked(instance){
        this.injection.instance = instance;
        this.injectionUI.updateInstanceDisplay();
    }
    autoChooseInject(){
        this.autoFillInjectionUseCase.execute(this.injection);
        this.injectionUI.updateInstanceDisplay();
    }
    createInstanceForInject(){
        this.createInsanceControllerIsh.createForInjection(this.injection);
    }
    createInstance(){
        this.createInsanceControllerIsh.createForInjection();
    }
    _onModuleSelect(module){
        this.createInstance(module);
        this.instancesDisplayUI.update();
        this.updateInstanceDisplay();
    }
    removeInstance(){
        this.injection.instance = false;
        this.updateInstanceDisplay();
    }
    canInjectBeAutoFilled(){
        this.autoFillInjectionUseCase.canBeAutoFilled(this.injection);
    }
}


class InstanceController{
    constructor({
        createInstanceUseCase,
        saveInstanceUseCase,
        deleteInstanceUseCase,
        modifyInstanceUI,
        sidePanelManager,
        instancesDisplayUI,
    }){
        this.deleteInstanceUseCase = deleteInstanceUseCase;
        this.saveInstanceUseCase = saveInstanceUseCase;
        this.modifyInstanceUI = modifyInstanceUI;
        this.sidePanelManager = sidePanelManager;
        this.createInstanceUseCase = createInstanceUseCase;
        this.instancesDisplayUI = instancesDisplayUI;
        
    }
    edit(instance){
        this.modifyInstanceUI.open(instance);
        this.sidePanelManager.changeToInstance();
    }
    onInstanceCreated(instance){
        this.modifyInstanceUI.open(instance);
        this.sidePanelManager.changeToInstance();
        this.instancesDisplayUI.update();
    }
    saveInstance(instance){
        this.saveInstanceUseCase.execute(instance);
        this.sidePanelManager.changeToApp();
        this.instancesDisplayUI.update();
    }
    deleteInstance(instance){
        this.deleteInstanceUseCase.execute(instance);
    }
    onInstanceRemoved(){
        this.sidePanelManager.changeToApp();
        this.instancesDisplayUI.update();
    }
}


class InjectUIFactory{
    constructor({
        instanceChooser,
        autoFillInjectionUseCase,
        createInsanceControllerIsh
    }){
        
        this.autoFillInjectionUseCase = autoFillInjectionUseCase;
        this.instanceChooser = instanceChooser;
        this.createInsanceControllerIsh = createInsanceControllerIsh;
    }
    createUI(injection,container){
        var controller = new InjectionController({
            injection,
            injectionUI,
            instanceChooser:this.instanceChooser,
            autoFillInjectionUseCase:this.autoFillInjectionUseCase,
            createInsanceControllerIsh: this.createInsanceControllerIsh
        });
        var ui = new InjectionUI({
            injection,//should probs be a viewmodel
            container,
            controller
        });

        controller.injectionUI = ui;
        return ui;
    }
}


class ModifyInstanceUI{
    constructor({
        moduleRepo, 
        chooseModuleUI, 
        saveInstanceUseCase, 
        instanceChooser
    }){
        this.saveInstanceUseCase = saveInstanceUseCase;
        this.chooseModuleUI = chooseModuleUI;
        this.instanceChooser = instanceChooser;
        this.element = document.getElementById("instanceInfoPanel");
        this.moduleRepo = moduleRepo;
        this.selectedModuleDisplay = this.element.querySelector(".moduleNameDisplay");
        this.selectedModuleInterfaceDisplay = this.element.querySelector(".interfaceNameDisplay");

        this.injectionContainer = document.querySelector(".instanceInfo .injectionContainer");
        this.injectionUIs = [];
        
        this._events();
    }
    _events(){
        this.element.querySelector(".saveButton").addEventListener("click",()=>{
            this.save();
        });
        // this.element.querySelector(".changeModuleButton").addEventListener("click",()=>{
        //     this.beginChangeModule();
        // });
        this.element.querySelector(".cancelButton").addEventListener("click",()=>{
            this.cancel();
        });
    }
    // beginChangeModule(modules){
    //     if(!modules){
    //         modules = this.moduleRepo.getAll();
    //     }
    //     this.chooseModuleUI.setAvailableModules(modules);
    //     this.chooseModuleUI.open((v)=>{this.setModule(v)})
    // }
    open(instance){
        if(!instance){
            throw "no instance";
        }
        this.instance = instance;
        this._displayInstanceValues();
        this._updateInjectionUI();
    }
    _displayInstanceValues(){
        this.element.querySelector(".instanceName").value = this.instance.name;

        this.selectedModuleDisplay.textContent = this.instance.module.name;
        this.selectedModuleInterfaceDisplay.textContent = this.instance.module.interface?.name??"No Interface";
    }
    setModule(module){
        this.instance.setModule(module);
        this._updateInjectionUI();
        this._displayInstanceValues();
        
    }
    _updateInjectionUI(){
        this.injectionUIs.map(i=>i.destroy());
        this.injectionUIs = [];

        if(!this.instance.injections.length){
            this.injectionContainer.textContent = "No Dependencies";
            return;
        }
        this.injectionContainer.textContent = "";
        this.instance.injections.map(i=>{
            var injectionUI = this.injectUIFactory.createUI(i,this.injectionContainer);
            this.injectionUIs.push(injectionUI);
        });
    }
    save(){
        //should probs move to thing
        if(this.instance.module.fakeModule){
            //err
            return;
        }

        var instance = this.instance;

        var name = this.element.querySelector(".instanceName").value;
        this.instance.name = name;

        this.saveInstanceUseCase.execute(instance);        
    }

    cancel(){
        this.sidePanelManager.changeToApp();
    }
}




//Definition End




//Dependency Injection Start


var app = new App();
var moduleRepo = new ModuleRepo();



var saveInstanceUseCase = new SaveInstanceUseCase({app});
var createInstanceUseCase = new CreateInstanceUseCase({app});
var deleteInstanceUseCase = new DeleteInstanceUseCase({app});
var autoFillInjectionUseCase = new AutoFillInjectionUseCase({app});
var getInstancesForInterface = new GetInstancesForInterface({app});
var setInjectionToInstanceUseCase = new SetInjectionToInstanceUseCase({createInstanceUseCase});


moduleRepo.loadModule("./Modules/HtmlContext.js");
moduleRepo.loadModule("./Modules/RootContainer.js");
moduleRepo.loadModule("./Modules/CenterLayout.js");
moduleRepo.loadModule("./Modules/AudioLoader.js");
moduleRepo.loadModule("./Modules/AudioController.js");
moduleRepo.loadModule("./Modules/PlayPauseControlUI.js");



var instancesDisplay = new InstancesDisplayUI({});
var moduleSelectUI = new ModuleSelectUI();
var modifyInstanceUI = new ModifyInstanceUI({saveInstanceUseCase, moduleRepo,chooseModuleUI:moduleSelectUI});
var sidePanelManager = new SidePanelManager({
    appInfoElement:document.getElementById("appInfoPanel"),
    instanceInfoElement:document.getElementById("instanceInfoPanel")
});



var instanceChooser = new InstanceChooser({});
modifyInstanceUI.instanceChooser = instanceChooser;
instancesDisplay.instanceChooser = instanceChooser;

var instanceController = new InstanceController({
    deleteInstanceUseCase,
    createInstanceUseCase,
    modifyInstanceUI,
    sidePanelManager,
    moduleRepo,
    instancesDisplayUI:instancesDisplay
});

var injectUIFactory = new InjectUIFactory({
    moduleRepo,
    instanceChooser,
    autoFillInjectionUseCase,
    createInstanceForInjectionUseCase
});



modifyInstanceUI.injectUIFactory = injectUIFactory


createInstanceUseCase.instancesUI = instancesDisplay;
createInstanceUseCase.modifyInstanceUI = modifyInstanceUI;
createInstanceUseCase.sidePanelManager = sidePanelManager;
createInstanceUseCase.iInstanceController = instanceController;

saveInstanceUseCase.instancesDisplay = instancesDisplay ;
saveInstanceUseCase.sidePanelManager = sidePanelManager;



//DI end

//Glue Start


sidePanelManager.changeToApp();


document.getElementById("addInstanceButton").addEventListener("click",()=>{
    createInstanceUseCase.execute();
})

moduleRepo.registerOnAllLoaded(()=>{
    (()=>{
        let rootMod = moduleRepo.getByName("RootElement");
        let rootIns = new Instance(rootMod);
        saveInstanceUseCase.execute(rootIns);
    })();

    (()=>{
        let docMod = moduleRepo.getByName("Html Document");
        let docIns = new Instance(docMod);
        saveInstanceUseCase.execute(docIns);
    })();

    createInstanceUseCase.execute();
    moduleSelectUI.onSet(moduleRepo.getByName("CenterLayout"));
    moduleSelectUI.close();


});

moduleRepo.allowAllLoadedCall();

var debug = ()=>{
    debugger;
}
document.getElementById("debugBreak").addEventListener("click",debug);