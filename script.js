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
        this._show(this.instanceInfoUI);
        this._hide(this.appInfoUI);
    }
    changeToApp(){
        this._hide(this.instanceInfoUI);
        this._show(this.appInfoUI);
    }
}

class CreateInstanceForDependencyUseCase {
    constructor({instaceRepo, moduleRepo, moduleDisplay}){
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
        instanceSelectUI,
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
        this.instanceSelectUI = instanceSelectUI;
        this.createInstanceForInjectionUseCase = createInstanceForInjectionUseCase;
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


class CreateInstanceUseCase{
    constructor({instanceRepo,instancesUI,modifyInstanceUI,sidePanelManager}={}){
        this.instanceRepo = instanceRepo;
        this.instancesUI = instancesUI;
        this.modifyInstanceUI = modifyInstanceUI;
        this.sidePanelManager = sidePanelManager;
    }
    execute(){
        this.modifyInstanceUI.open();
        this.sidePanelManager.changeToInstance();
    }
}


class ModuleSelectUI{
    constructor({moduleRepo}){
        this.dialog = document.getElementById("chooseModuleDialog");
        this.moduleContainer = this.dialog.querySelector(".moduleOptionContainer");
        this.modules = []
        this._events();
    }
    _events(){
        this.dialog.querySelector(".chooseButton").addEventListener("click",()=>{
            this.save();
        });
        this.dialog.querySelector(".closeButton").addEventListener("click",()=>{
            this.close();
        });
        this.dialog.addEventListener("close",()=>{
            this._onClose();
        });
    }
    setAvailableModules(modules){
        if(this.modules.length==modules.length && this.modules.every(m=>modules.some(b=>b.name == m.name))){
            return;
        }
        this.modules = modules;
        this.moduleContainer.innerHTML = "";
        modules.map(m=>{
            var item = new TemplatedHtml("moduleSelect");
            var id = Math.random();
            item.setText("moduleName",m.name)
            item.setText("moduleInterface",m.interface?.name??"No Interface");
            var radio = item.getElement("moduleInstanceRadio");
            radio.value = m.name;
            radio.id = id;
            item.element.setAttribute("for",id);
            this.moduleContainer.append(item.element);
        });
    }
    _onClose(){

        this._isOpen = false;
    }
    open(onSet){
        if(this._isOpen){
            return;
        }
        this._isOpen = true;
        this.onSet = onSet;
        this.dialog.showModal();
    }
    save(){
        var chosenModuleName = this.dialog.querySelector(".moduleInstanceRadio:checked").value;
        var module = moduleRepo.getByName(chosenModuleName);
        this.onSet(module);
        this.close();
    }
    close(){
        this._isOpen = false;
        this.dialog.close();
    }
}


class InstanceSelectUI{
    constructor({instanceRepo}){
        this.dialog = document.getElementById("chooseInstanceDialog");
        this.moduleContainer = this.dialog.querySelector(".moduleOptionContainer");
        this.modules = []
        this._events();
    }
    _events(){
        this.dialog.querySelector(".chooseButton").addEventListener("click",()=>{
            this.save();
        });
        this.dialog.querySelector(".closeButton").addEventListener("click",()=>{
            this.close();
        });
        this.dialog.addEventListener("close",()=>{
            this._onClose();
        });
    }
    setAvailableInstances(instances){
        if(this.modules.length==instances.length && this.modules.every(m=>instances.some(b=>b.name == m.name))){
            return;
        }
        this.modules = instances;
        this.moduleContainer.innerHTML = "";
        instances.map(i=>{
            var item = new TemplatedHtml("moduleSelect");
            var id = Math.random();
            item.setText("moduleName",i.name)
            item.setText("moduleInterface",i.module.name);
            var radio = item.getElement("moduleInstanceRadio");
            radio.value = i.name;
            radio.id = id;
            item.element.setAttribute("for",id);
            this.moduleContainer.append(item.element);
        });
    }
    _onClose(){
        this._isOpen = false;
    }
    open(onSet){
        if(this._isOpen){
            return;
        }
        this._isOpen = true;
        this.onSet = onSet;
        this.dialog.showModal();
    }
    save(){
        var chosenModuleName = this.dialog.querySelector(".moduleInstanceRadio:checked").value;
        var module = moduleRepo.getByName(chosenModuleName);
        this.onSet(module);
        this.close();
    }
    close(){
        this._isOpen = false;
        this.dialog.close();
    }
}


class ModifyInstanceUI{
    constructor({moduleRepo, chooseModuleUI,saveInstanceUseCase}){
        this.saveInstanceUseCase = saveInstanceUseCase;
        this.chooseModuleUI = chooseModuleUI;
        this.element = document.getElementById("instanceInfoPanel");
        this.moduleRepo = moduleRepo;
        this.selectedModuleDisplay = this.element.querySelector(".moduleNameDisplay");
        this.selectedModuleInterfaceDisplay = this.element.querySelector(".moduleNameDisplay");

        this.injectionContainer = document.querySelector(".instanceInfo .injectionContainer");
        this.injectionUIs = [];
        
        this._events();
    }
    _events(){
        this.element.querySelector(".saveButton").addEventListener("click",()=>{
            this.save();
        });
        this.element.querySelector(".changeModuleButton").addEventListener("click",()=>{
            this.chooseModuleUI.setAvailableModules(this.moduleRepo.getAll());
            this.chooseModuleUI.open((v)=>{this.setModule(v)})
        });
    }
    open(instance){
        if(instance){
            this.instance = instance;
        }else{
            var modulePlaceholder = {fakeModule:true,name:"not set",dependencies:[]};
            this.instance = new Instance(modulePlaceholder);
            this.instance.name = "";
            this.instance.isNew = true;
            
        }
        
        this._displayInstanceValues();
    }
    _displayInstanceValues(){
        this.element.querySelector(".instanceName").value = this.instance.name;
        
        this.selectedModuleDisplay.textContent = this.instance.module.name;
        this.selectedModuleInterfaceDisplay.textCOntent = this.instance.module.interface?.name??"No Interface";
    }
    setModule(module){
        if(this.instance.module.name != module.name){
            this.injectionUIs.map(i=>i.destroy());
        }

        this.instance.module = module;
        this._displayInstanceValues();
        
        this.injectionUIs = [];
        instance.injections.map(i=>{
            var injectionUI = new InjectionUI(i, this.injectionContainer,this.instanceRepo,this.moduleRepo,this.moduleSelectUi,this.createInstanceForInjectionUseCase)
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
        if(!this.instance.isNew){
            instance = new Instance(module);
        }
        var name = this.element.querySelector(".instanceName").value
        if(name){
            instance.name = name;
        }
        else{
            instance.name = instance.module.name+"-"+Math.random();
        }

        this.saveInstanceUseCase.execute(instance);
        
    }
}

class SaveInstanceUseCase{
    constructor({sidePanelManager,instanceRepo,instancesDisplay}){
        this.sidePanelManager = sidePanelManager;
        this.instanceRepo = instanceRepo;
        this.instancesDisplay = instancesDisplay;
    }
    execute(instance){
        if(!this.instanceRepo.getByName(instance.name)){

            this.instanceRepo.add(instance); 
        }
        this.instancesDisplay.update();
        this.sidePanelManager.changeToApp();
        
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


var saveInstanceUseCase = new SaveInstanceUseCase({
    instanceRepo
});

var createInstanceUseCase = new CreateInstanceUseCase({
    instanceRepo
});

var instancesDisplay = new InstancesDisplayUI(instanceRepo);
var moduleSelectUI = new ModuleSelectUI({moduleRepo});
var modifyInstanceUI = new ModifyInstanceUI({saveInstanceUseCase, moduleRepo,chooseModuleUI:moduleSelectUI});
var sidePanelManager = new SidePanelManager({
    appInfoElement:document.getElementById("appInfoPanel"),
    instanceInfoElement:document.getElementById("instanceInfoPanel")
});


createInstanceUseCase.instancesUI = instancesDisplay;
createInstanceUseCase.modifyInstanceUI = modifyInstanceUI;
createInstanceUseCase.sidePanelManager = sidePanelManager;

saveInstanceUseCase.instancesDisplay = instancesDisplay ;
saveInstanceUseCase.sidePanelManager = sidePanelManager;



sidePanelManager.changeToApp();


document.getElementById("addInstanceButton").addEventListener("click",()=>{
    createInstanceUseCase.execute();
})

moduleRepo.registerOnAllLoaded(()=>{
    createInstanceUseCase.execute();
});

moduleRepo.allowAllLoadedCall();