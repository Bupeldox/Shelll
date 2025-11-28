import { AutoFillInjectionUseCase } from "./UseCases/AutoFillInjectionUseCase.js";
import { SetInjectionToInstanceUseCase } from "./UseCases/SetInjectionToInstanceUseCase.js";
import { SaveInstanceUseCase } from "./UseCases/SaveInstanceUseCase.js";
import { DeleteInstanceUseCase } from "./UseCases/DeleteInstanceUseCase.js";
import { CreateInstanceUseCase } from "./UseCases/CreateInstanceUseCase.js";
import { GetInstancesForInterfaceUseCase } from "./UseCases/GetInstancesForInterfaceUseCase.js";
import { GetAllModulesUseCase } from "./UseCases/GetAllModulesUseCase.js";

import { App, Dependency, Injection, Instance, Interface, Module} from "./Models.js"
import { ModuleRepo } from "./Repos.js";
import TemplatedHtml from "./TemplatedHtml.js";
import { InstanceChooser, ModuleSelectUI, SidePanelManager, SmallInstanceDisplay, InstancesDisplayUI } from "./UIIDontWantTOMessWIth.js";
import { GetAllInstancesUseCase } from "./UseCases/GetAllInstancesUseCase.js";
import { GetModulesForInterfaceUseCase } from "./UseCases/GetModulesForInterfaceUseCase.js";


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



class CreateInstanceControllerIsh{

    constructor({
        instanceController,
        chooseModuleUI,
        instancesDisplayUI,
        getModulesForInterfaceUseCase,
        getAllModulesUseCase,
        createInstanceUseCase,
        setInjectionToInstanceUseCase,
    }){ 
        this.instanceController = instanceController;
        this.chooseModuleUI = chooseModuleUI;
        this.instancesDisplayUI = instancesDisplayUI;
        this.getModulesForInterfaceUseCase = getModulesForInterfaceUseCase;
        this.getAllModulesUseCase = getAllModulesUseCase;
        this.createInstanceUseCase = createInstanceUseCase;
        this.setInjectionToInstanceUseCase = setInjectionToInstanceUseCase;
    }
    createForInjection(injection){
        var modules = this.getModulesForInterfaceUseCase.execute(injection.dependency.interface);
        this.chooseModuleUI.setAvailableModules(modules);
        this.chooseModuleUI.open((module)=>{
            debugger;
            var instance = this.createInstanceUseCase.execute(module);
            this.setInjectionToInstanceUseCase.execute(injection,instance);
            this.instancesDisplayUI.update();
            this._showEditFor(instance);
        });
    }
    create(){
        var modules = this.getAllModulesUseCase.execute();
        this.chooseModuleUI.setAvailableModules(modules);
        this.chooseModuleUI.open((module)=>{
            var instance = this.createInstanceUseCase.execute(module);
            this.instancesDisplayUI.update();
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
     * @param {CreateInstanceControllerIsh} param0.createInstanceControllerIsh
     */
    constructor({
        injection,
        injectionUI,
        instanceChooser,
        autoFillInjectionUseCase,
        createInstanceControllerIsh,
        instancesDisplayUI,
    }){
        this.injection = injection;
        this.autoFillInjectionUseCase = autoFillInjectionUseCase;
        this.injectionUI = injectionUI;
        this.instanceChooser = instanceChooser;
        this.createInstanceControllerIsh = createInstanceControllerIsh
        this.instancesDisplayUI = instancesDisplayUI;
    }
    chooseInstance(){
        this.instanceChooser.registerOnPick((i)=>{this._onInstancePicked(i)});
        
    }
    _onInstancePicked(instance){
        this.injection.instance = instance;
        this.injectionUI.updateInstanceDisplay();
        this.instancesDisplayUI.update();
    }
    autoChooseInject(){
        this.autoFillInjectionUseCase.execute(this.injection);
        this.injectionUI.updateInstanceDisplay();
        this.instancesDisplayUI.update();
    }
    createInstanceForInject(){
        this.createInstanceControllerIsh.createForInjection(this.injection);
    }
    createInstance(){
        this.createInstanceControllerIsh.createForInjection();
    }
    _onModuleSelect(module){
        this.createInstance(module);
        this.instancesDisplayUI.update();
        this.injectionUI.updateInstanceDisplay();
    }
    removeInstance(){
        this.injection.instance = false;
        this.injectionUI.updateInstanceDisplay();
        this.instancesDisplayUI.update();
    }
    canBeAutoFilled(){
        return this.autoFillInjectionUseCase.canBeAutoFilled(this.injection);
    }
}


class InstanceController{
    constructor({
        createInstanceUseCase,
        saveInstanceUseCase,
        deleteInstanceUseCase,
        modifyInstanceUI,
        sidePanelManager,
        instancesDisplayUI
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
    save(instance){
        this.saveInstanceUseCase.execute(instance);
        this.sidePanelManager.changeToApp();
        this.instancesDisplayUI.update();
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
        this.instancesDisplayUI.update();
        this.sidePanelManager.changeToApp();
    }
    onInstanceRemoved(){
        this.sidePanelManager.changeToApp();
        this.instancesDisplayUI.update();
    }
    cancelEdit(){
        this.sidePanelManager.changeToApp();
    }
}


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


class ModifyInstanceUI{
    constructor({
        moduleRepo, 
        chooseModuleUI, 
        saveInstanceUseCase, 
        instanceChooser,
        controller
    }){
        this.saveInstanceUseCase = saveInstanceUseCase;
        this.chooseModuleUI = chooseModuleUI;
        this.instanceChooser = instanceChooser;
        this.controller = controller;
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
            this.controller.save(this.instance);
        });
        this.element.querySelector(".cancelButton").addEventListener("click",()=>{
            this.controller.cancelEdit();
        });
        this.element.querySelector(".deleteButton").addEventListener("click",()=>{
            this.controller.deleteInstance(this.instance);
        });
    } 
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
    clearErrors(){

    }
    showError(err){

    }
}


class AppLoader{
    constructor(){

    }
    load(appJson){
        
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
var getInstancesForInterfaceUseCase = new GetInstancesForInterfaceUseCase({app});
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
    createInstanceUseCase,
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