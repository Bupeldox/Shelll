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

class AutoFillInjectionUseCase{
    constructor({instanceRepo}){
        this.instanceRepo = instanceRepo;
    }
    canBeAutoFilled(injection){
        var interfaceName = injection.dependency.interface.name;
        var availableInstances = this.instanceRepo.getByInterface(interfaceName);
        return availableInstances.length == 1;
    }
    execute(injection,injectionUI){
        var interfaceName = injection.dependency.interface.name;
        var availableInstances = this.instanceRepo.getByInterface(interfaceName);
        if(availableInstances.length != 1){
            throw "cant be autofilled";
        }
        injection.instance = availableInstances[0];
        injectionUI.updateInstanceDisplay();
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
        instanceChooser,
        autoFillInjectionUseCase,
    }){
        this.instanceChooser = instanceChooser;
        this.autoFillInjectionUseCase = autoFillInjectionUseCase;
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
            if(this.autoFillInjectionUseCase.canBeAutoFilled(this.injection)){
                this.ui.getElement("injectionChoose").style.display = "none";
                this.ui.getElement("injectionAuto").style.display = "";
            }else{
                this.ui.getElement("injectionChoose").style.display = "";
                this.ui.getElement("injectionAuto").style.display = "none";
            }
        }
    }
    _onInjectionChooseButton(){
        this.instanceChooser.registerOnPick((i)=>{this._onInstancePicked(i)});
    }
    _onInstancePicked(instance){
        this.injection.instance = instance;
        this.updateInstanceDisplay();
    }
    _onInjectionAutoButton(){
        this.autoFillInjectionUseCase.execute(this.injection,this);
    }
    _onInjectionCreateButton(){
        this.createInstanceForInjectionUseCase.execute(this.injection);
    }
    _onRemoveCurrentInstance(){
        this.injection.instance = false;
        this.updateInstanceDisplay();
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

class CreateInstanceForInjectionUseCase{
    constructor({
        instanceRepo,moduleRepo,moduleSelectUI,iInstanceController,saveInstanceUseCase
    }){
        this.moduleRepo = moduleRepo;
        this.iInstanceController = iInstanceController;
        this.createInstanceUseCase = new CreateInstanceUseCase({saveInstanceUseCase,instanceRepo,moduleRepo,moduleSelectUI,iInstanceController:this});
    }
    execute(injection){
        this.injection = injection;
        var modules = this.moduleRepo.getByInterfaceName(injection.dependency.interface.name);
        this.createInstanceUseCase.execute(modules);
    }
    onInstanceCreated(instance){
        this.injection.instance = instance;
        this.iInstanceController.onInstanceCreated(instance);
    }
}


class CreateInstanceUseCase{
    constructor({instanceRepo,moduleRepo,moduleSelectUI,iInstanceController,saveInstanceUseCase}){
        this.instanceRepo = instanceRepo;
        this.moduleRepo = moduleRepo;
        this.moduleSelectUI = moduleSelectUI;
        this.iInstanceController = iInstanceController;
        this.saveInstanceUseCase = saveInstanceUseCase;
        
    }
    execute(filteredModules = false){     
        if(!filteredModules){
            filteredModules = moduleRepo.getAll();
        }
        moduleSelectUI.setAvailableModules(filteredModules);
        moduleSelectUI.open((t)=>{
            this._onModuleSelect(t)
        })
    }
    _onModuleSelect(module){
        var instance = new Instance(module);
        instance.name = "";
        this.saveInstanceUseCase.execute(instance);
        this.iInstanceController.onInstanceCreated(instance);
    }
}

class DeleteInstanceUseCase{
    constructor({instanceRepo,iInstanceController}){
        this.instanceRepo = instanceRepo;
        this.iInstanceController = iInstanceController;
    }
    execute(instance){
        this.instanceRepo.remove(instance)
        this.iInstanceController.onInstanceRemoved();
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
    createInstance(){
        this.createInstanceUseCase.execute();
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

class ModuleSelectUI{
    constructor(){
        this.dialog = document.getElementById("chooseModuleDialog");
        this.moduleContainer = this.dialog.querySelector(".moduleOptionContainer");
        this.modules = []
        this._events();
    }
    _events(){
        this.dialog.querySelector(".chooseButton").addEventListener("click",()=>{
            this.choose();
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
    choose(){
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

class InjectUIFactory{
    constructor({
        instanceRepo,
        moduleRepo,
        instanceSelectUI,
        instanceChooser,
        autoFillInjectionUseCase,
        createInstanceForInjectionUseCase
    }){
        this.instanceRepo = instanceRepo;
        this.autoFillInjectionUseCase = autoFillInjectionUseCase;
        this.moduleRepo = moduleRepo;
        this.instanceSelectUI = instanceSelectUI;
        this.instanceChooser = instanceChooser;
        this.createInstanceForInjectionUseCase = createInstanceForInjectionUseCase;
    }
    createUI(injection,container){
        var ui = new InjectionUI({
            injection, 
            container,
            instanceRepo: this.instanceRepo,
            moduleRepo: this.moduleRepo,
            instanceSelectUI: this.moduleSelectUi,
            instanceChooser:this.instanceChooser,
            autoFillInjectionUseCase:this.autoFillInjectionUseCase,
            createInstanceForInjectionUseCase:this.createInstanceForInjectionUseCase
        });
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

class SaveInstanceUseCase{
    constructor({instanceRepo}){
        this.instanceRepo = instanceRepo;
    }
    execute(instance){
        if(!instance.name){
            instance.name = instance.module.name+"-"+Math.random();
        }
        delete instance.isNew;

        if(!this.instanceRepo.getById(instance.id)){
            this.instanceRepo.add(instance); 
        }
    }
}


//Definition End




//Dependency Injection Start


var app = new App();
var moduleRepo = new ModuleRepo();
var instanceRepo = new InstanceRepo(app);


var saveInstanceUseCase = new SaveInstanceUseCase({
    instanceRepo
});


var deleteIns




moduleRepo.loadModule("./Modules/HtmlContext.js");
moduleRepo.loadModule("./Modules/RootContainer.js");
moduleRepo.loadModule("./Modules/CenterLayout.js");
moduleRepo.loadModule("./Modules/AudioLoader.js");
moduleRepo.loadModule("./Modules/AudioController.js");
moduleRepo.loadModule("./Modules/PlayPauseControlUI.js");


var createInstanceUseCase = new CreateInstanceUseCase({
    instanceRepo,
    moduleRepo,
    saveInstanceUseCase
});

var saveInstanceUseCase = new SaveInstanceUseCase({instanceRepo});

var instancesDisplay = new InstancesDisplayUI({instanceRepo});
var moduleSelectUI = new ModuleSelectUI();
var modifyInstanceUI = new ModifyInstanceUI({saveInstanceUseCase, moduleRepo,chooseModuleUI:moduleSelectUI});
var sidePanelManager = new SidePanelManager({
    appInfoElement:document.getElementById("appInfoPanel"),
    instanceInfoElement:document.getElementById("instanceInfoPanel")
});


var beginEditInstanceUseCase = new BeginEditInstanceUseCase({modifyInstanceUI,sidePanelManager});
var instanceChooser = new InstanceChooser({beginEditInstanceUseCase,instanceRepo});
modifyInstanceUI.instanceChooser = instanceChooser;
instancesDisplay.instanceChooser = instanceChooser;

var instanceController = new InstanceController({
    createInstanceUseCase,
    modifyInstanceUI,
    sidePanelManager,
    moduleRepo,
    instancesDisplayUI:instancesDisplay
});

var autoFillInjectionUseCase = new AutoFillInjectionUseCase({instanceRepo});
var createInstanceForInjectionUseCase = new CreateInstanceForInjectionUseCase({saveInstanceUseCase,instanceRepo,moduleRepo,moduleSelectUI,iInstanceController:instanceController});
var injectUIFactory = new InjectUIFactory({
    instanceRepo,
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