import {App,Dependency,Injection,Instance,Interface,Module} from "./Models.js"
import { ModuleRepo,InstanceRepo } from "./Repos.js";
import TemplatedHtml from "./TemplatedHtml.js";


class SidePanelManager {
    constructor({appInfoElement, instanceInfoElement}){
        this.appInfoUI = appInfoElement;
        this.instanceInfoUI = instanceInfoElement;
    }
    _hide(el){
        el.style.display="none";
    }
    _show(el){
        el.style.display="";
    }
    changeToInstance(){
        this.show(this.instanceInfoUI);
        this.hide(this.appInfoUI);
    }
    changeToApp(){
        this.hide(this.instanceInfoUI);
        this.show(this.appInfoUI);
    }
}

class CreateInstanceForDependencyUseCase {
    constructor(instaceRepo, moduleRepo, moduleDisplay){
        this.instaceRepo = instaceRepo;
        this.moduleRepo = moduleRepo;
        this.moduleDisplay = moduleDisplay;
    }
    createInstance(injection, module){
        var newInstance = new Instance();
        newInstance.module = module;
        injection.instance = newInstance;
        this.moduleDisplay = moduleDisplay;
    }
}

class InjectionUI {
    constructor(
        injection,
        container,
        instanceRepo,
        moduleRepo,
        moduleSelectUi,
        createInstanceForInjectionUseCase
    ){
        this.injection = injection;
        var ui = new TemplatedHtml("injection");
        container.append(ui);
        ui.setText("t-name",injection.name);
        ui.setValue("t-interface",injection.interface?.name??"No interface");
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



class InstancesDisplayUI{
    constructor(instanceRepo){
        this.instanceRepo = instanceRepo;
        this.container = document.getElementById("instancesDisplay")
        this.UIMap = new Map();
    }
    update(){
        var instances = this.instanceRepo.getAll();

        instances.map(i=>{
            if(!this.UIMap.has(i)){
                var item = new TemplatedHtml("instanceSmallDisplay");
                item.setText("instanceName",i.name)
                item.setText("instanceModule",i.module.name)
                item.setText("instanceInterface",i.module.interface?.name??"No interface")
                this.container.prepend(item.element);
                this.UIMap.set(i,item);
            }
        });

        for(let [key,value] of this.UIMap){
            if(!instances.some(i=>i.name = key.name)){
                var item = this.UIMap.get(key);
                item.destroy();
                this.UIMap.delete(key);
            }
        }
    }
}

class InstanceUI {
    constructor(){
        this.nameElement = document.querySelector(".instanceInfo .instanceName");
        this.moduleName = document.querySelector(".instanceInfo .moduleName");
        this.interfaceName = document.querySelector(".instanceInfo .interfaceName");
        this.injectionContainer = document.querySelector(".instanceInfo .injectionContainer");
        this.injectionUIs = [];
    }
    load(instance){
        this.injectionUIs.map(i=>i.destroy());
        
        //set name
        //set module
        //set interface
        //get dependencies in ui

        this.nameElement.textContent = instance.name;
        this.moduleName.textContent = instance.module.name;
        this.interfaceName.textContent = instance.module.interface?.name??"No interface"
        
        this.injectionUIs = [];
        instance.injections.map(i=>{
            var injectionUI = new InjectionUI(i, this.injectionContainer,this.instanceRepo,this.moduleRepo,this.moduleSelectUi,this.createInstanceForInjectionUseCase)
            this.injectionUIs.push(injectionUI);
        });
    }
    open(){
        
    }
}

class CreateInstanceUseCase{
    constructor({instanceRepo,instancesUI,modifyInstanceUI,sidePanelManager}){
        this.instanceRepo = instanceRepo;
        this.instancesUI = instancesUI;
        this.modifyInstanceUI = modifyInstanceUI;
        this.sidePanelManager = sidePanelManager;
    }
    execute(){
        var dummyModule ={
            name:"dummy",
            dependencies:[]
        };
        var instance = new Instance(dummyModule);

        this.instanceRepo.add(instance);
        this.instancesUI.update();
        this.modifyInstanceUI.open(instance);
    }
}

class ModuleSelectUI{
    constructor(){
        this.dialog = document.getElementById("chooseModuleDialog");
    }
    setAvailable(modules){
        this.modules = modules;
    }
    open(){
        this.dialog.showModal();
    }
    close(){
        this.dialog.close();
    }
}

class ModifyInstanceUI{
    constructor({moduleRepo,instancesDisplay}){

        this.instanceRepo = instanceRepo;
        this.element = document.getElementById("instanceInfoPanel");
        this.moduleRepo = moduleRepo;
        this.instancesDisplay = instancesDisplay;
        this.moduleSelectContainer = document.getElementById("moduleSelect");
        this._events();
    }
    _events(){
        this.dialog.querySelector(".createButton").addEventListener("click",()=>{this.create();})
        this.dialog.querySelector(".closeButton").addEventListener("click",()=>{this.close();})
    }
    open(instance){
        
        var modules = this.moduleRepo.getAll();
        
        if(instance){
            this.instance = instance;
        }
    }
    create(){
        //could move this to usecase.
        var moduleName = this.dialog.querySelector(".moduleInstanceRadio:checked").value;
        var module = this.moduleRepo.getByName(moduleName);
        
        var instance = this.instance;
        if(!this.instance){
            instance = new Instance(module);
        }
        var name = this.dialog.querySelector(".instanceName").value
        if(name){
            instance.name = name;
        }
        else{
            instance.name = module.name+"-"+Math.random();
        }

        instanceRepo.add(instance);
        this.instancesDisplay.update();
    }
    save(){
        
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

var instancesDisplay = new InstancesDisplayUI(instanceRepo);
var modifyInstanceUI = new ModifyInstanceUI({instanceRepo,moduleRepo,instancesDisplay});


var sidePanelManager = new SidePanelManager({
    appInfoElement:document.getElementById("appInfoPanel"),
    instanceInfoElement:document.getElementById("instanceInfoPanel")
});

var createInstanceUseCase = new CreateInstanceUseCase({
    instanceRepo,
    instancesUI:instancesDisplay,
    modifyInstanceUI,
    sidePanelManager
});

createInstanceUseCase.execute();


document.getElementById("addInstanceButton").addEventListener("click",()=>{
    createInstanceUseCase.execute();
})