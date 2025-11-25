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
    constructor({
        injection,
        container,
        instanceRepo,
        moduleRepo,
        instanceSelectUI,
        createInstanceForInjectionUseCase,
        instanceChooser
    }){
        this.instanceChooser = instanceChooser;
        this.injection = injection;
        var ui = new TemplatedHtml("injection");
        container.append(ui.element);
        ui.setText("t-name",injection.dependency.name);
        ui.setText("t-interface",injection.dependency.interface?.name??"No interface");
        ui.setValue("injectionId",injection.id);
        this.moduleRepo = moduleRepo;
        this.instanceRepo = instanceRepo;
        this.instanceSelectUI = instanceSelectUI;
        this.createInstanceForInjectionUseCase = createInstanceForInjectionUseCase;
        ui.getElement("injectionChoose").addEventListener("click",()=>{this._onInjectionChooseButton()});
        ui.getElement("injectionAuto").addEventListener("click",()=>{  this._onInjectionAutoButton()});
        ui.getElement("injectionCreate").addEventListener("click",()=>{this._onInjectionCreateButton()});
        ui.getElement("removeCurrentInstance").addEventListener("click",()=>{this._onRemoveCurrentInstance()});
        this.ui = ui;
        this._updateInstanceDisplay();
    }
    destroy(){
        this.ui.element.remove();
    }
    _updateInstanceDisplay(){
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
        }
    }
    _onInjectionChooseButton(){
        this.instanceChooser.registerOnPick((i)=>{this._onInstancePicked(i)});
    }
    _onInstancePicked(instance){
        this.injection.instance = instance;
        this._updateInstanceDisplay();
    }
    _onInjectionAutoButton(){
        
    }
    _onInjectionCreateButton(){
        
    }
    _onRemoveCurrentInstance(){
        this.injection.instance = false;
        this._updateInstanceDisplay();
    }

}

class BeginEditInstanceUseCase{
    constructor({modifyInstanceUI,sidePanelManager}){
        this.modifyInstanceUI = modifyInstanceUI
        this.sidePanelManager = sidePanelManager;
    }
    execute(instance){
        this.modifyInstanceUI.open(instance);
        this.sidePanelManager.changeToInstance();
    }
}
    

class InstanceChooser{
    constructor({beginEditInstanceUseCase}){
        this.beginEditInstanceUseCase = beginEditInstanceUseCase;
        this.instance = false;
        this._onPick = false;
    }
    pick(instance){
        if(this._onPick){
            this._onPick(instance);
            this._onPick = false;
            return;
        }
        this.beginEditInstanceUseCase.execute(instance);
    }   
    registerOnPick(func){
        this._onPick = func;
    }
}

class SmallInstanceDisplay{
    constructor(instance){
        var item = new TemplatedHtml("instanceSmallDisplay");
        this.element = item.element;
        this.item = item;
        this.update(instance);
        
    }
    update(i){
        this.item.setText("instanceName",i.name)
        this.item.setText("instanceModule",i.module.name)
        this.item.setText("instanceInterface",i.module.interface?.name??"No interface")
    }
    appendTo(container){
        container.append(this.element);
    }
    prependTo(container){
        container.prepend(this.element);
    }
}

class InstancesDisplayUI{
    constructor({instanceRepo,instanceChooser}){
        this.instanceRepo = instanceRepo;
        this.instanceChooser = instanceChooser;
        this.container = document.getElementById("instancesDisplay")
        this.UIMap = new Map();
    }
    update(){
        var instances = this.instanceRepo.getAll();

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


class BeginCreateInstanceUseCase{
    constructor({instanceRepo,instancesUI,modifyInstanceUI,sidePanelManager}={}){
        this.instanceRepo = instanceRepo;
        this.instancesUI = instancesUI;
        this.modifyInstanceUI = modifyInstanceUI;
        this.sidePanelManager = sidePanelManager;
    }
    execute(){
        this.modifyInstanceUI.open();
        this.sidePanelManager.changeToInstance();
        this.modifyInstanceUI.beginChangeModule();
    }
}


class ModuleSelectUI{
    constructor(){
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

class CancelModifyInstanceUseCase{
    constructor(sidePanelManager){
        this.sidePanelManager = sidePanelManager;
    }
    execute(){
        this.sidePanelManager.changeToApp();
    }

}

class ModifyInstanceUI{
    constructor({moduleRepo, chooseModuleUI, saveInstanceUseCase, instanceChooser,cancelModifyInstanceUseCase}){
        this.saveInstanceUseCase = saveInstanceUseCase;
        this.cancelModifyInstanceUseCase = cancelModifyInstanceUseCase;
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
        this.element.querySelector(".changeModuleButton").addEventListener("click",()=>{
            this.beginChangeModule();
        });
        this.element.querySelector(".cancelButton").addEventListener("click",()=>{
            this.cancel();
        });
    }
    beginChangeModule(){
        this.chooseModuleUI.setAvailableModules(this.moduleRepo.getAll());
        this.chooseModuleUI.open((v)=>{this.setModule(v)})
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
            var injectionUI = new InjectionUI({
                injection: i, 
                container: this.injectionContainer,
                instanceRepo: this.instanceRepo,
                moduleRepo: this.moduleRepo,
                instanceSelectUI: this.moduleSelectUi,
                createInstanceForInjectionUseCase: this.createInstanceForInjectionUseCase,
                instanceChooser:this.instanceChooser
            });
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
        this.cancelModifyInstanceUseCase.execute();
    }
}

class SaveInstanceUseCase{
    constructor({sidePanelManager,instanceRepo,instancesDisplay}){
        this.sidePanelManager = sidePanelManager;
        this.instanceRepo = instanceRepo;
        this.instancesDisplay = instancesDisplay;
    }
    execute(instance){
        if(!instance.name){
            instance.name = instance.module.name+"-"+Math.random();
        }
        delete instance.isNew;
        if(!this.instanceRepo.getByName(instance.name)){

            this.instanceRepo.add(instance); 
        }
        this.instancesDisplay.update();
        this.sidePanelManager.changeToApp();
        
    }
}



var app = new App();
var moduleRepo = new ModuleRepo();
var instanceRepo = new InstanceRepo(app);


var saveInstanceUseCase = new SaveInstanceUseCase({
    instanceRepo
});







moduleRepo.loadModule("./Modules/HtmlContext.js");
moduleRepo.loadModule("./Modules/RootContainer.js");
moduleRepo.loadModule("./Modules/CenterLayout.js");
moduleRepo.loadModule("./Modules/AudioLoader.js");
moduleRepo.loadModule("./Modules/AudioController.js");
moduleRepo.loadModule("./Modules/PlayPauseControlUI.js");



var beginCreateInstanceUseCase = new BeginCreateInstanceUseCase({
    instanceRepo
});

var cancelModifyInstanceUseCase = new CancelModifyInstanceUseCase({
});


var instancesDisplay = new InstancesDisplayUI({instanceRepo});
var moduleSelectUI = new ModuleSelectUI();
var modifyInstanceUI = new ModifyInstanceUI({saveInstanceUseCase, moduleRepo,chooseModuleUI:moduleSelectUI,cancelModifyInstanceUseCase});
var sidePanelManager = new SidePanelManager({
    appInfoElement:document.getElementById("appInfoPanel"),
    instanceInfoElement:document.getElementById("instanceInfoPanel")
});


var beginEditInstanceUseCase = new BeginEditInstanceUseCase({modifyInstanceUI,sidePanelManager});
var instanceChooser = new InstanceChooser({beginEditInstanceUseCase,instanceRepo});
modifyInstanceUI.instanceChooser = instanceChooser;
instancesDisplay.instanceChooser = instanceChooser;

cancelModifyInstanceUseCase.sidePanelManager = sidePanelManager;

beginCreateInstanceUseCase.instancesUI = instancesDisplay;
beginCreateInstanceUseCase.modifyInstanceUI = modifyInstanceUI;
beginCreateInstanceUseCase.sidePanelManager = sidePanelManager;

saveInstanceUseCase.instancesDisplay = instancesDisplay ;
saveInstanceUseCase.sidePanelManager = sidePanelManager;



sidePanelManager.changeToApp();


document.getElementById("addInstanceButton").addEventListener("click",()=>{
    beginCreateInstanceUseCase.execute();
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

    beginCreateInstanceUseCase.execute();
    moduleSelectUI.onSet(moduleRepo.getByName("CenterLayout"));
    moduleSelectUI.close();


});

moduleRepo.allowAllLoadedCall();

var debug = ()=>{
    debugger;
}
document.getElementById("debugBreak").addEventListener("click",debug);