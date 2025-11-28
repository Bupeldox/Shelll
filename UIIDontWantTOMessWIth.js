import TemplatedHtml from "./TemplatedHtml.js";


export class InstanceSelectUI{
    constructor({instanceRepo}){
        this.dialog = document.getElementById("chooseInstanceDialog");
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


export class ModuleSelectUI{
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
        var module = this.modules.find(i=>i.name == chosenModuleName);
        this.onSet(module);
        this.close();
    }
    close(){
        this._isOpen = false;
        this.dialog.close();
    }
}




export class InstanceChooser{
    constructor({instanceController}){
        this.instanceController = instanceController;
        this.instance = false;
        this._onPick = false;
    }
    pick(instance){
        if(this._onPick){
            this._onPick(instance);
            this._onPick = false;
            return;
        }
        this.instanceController.edit(instance);
    }   
    registerOnPick(func){
        this._onPick = func;
    }
}


export class SidePanelManager {
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


export class SmallInstanceDisplay{
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
        if(i.injections.some(i=>!i.instance)){//should be in controller
            this.item.setText("instanceError","missing Injects");
        }else{
            this.item.setText("instanceError","");
        }
    }
    appendTo(container){
        container.append(this.element);
    }
    prependTo(container){
        container.prepend(this.element);
    }
    destroy(){
        this.element.remove();
    }
}



export class InstancesDisplayUI{
    constructor({getAllInstancesUseCase,instanceChooser}){
        this.getAllInstancesUseCase = getAllInstancesUseCase;
        this.instanceChooser = instanceChooser;
        this.container = document.getElementById("instancesDisplay");
        this.UIMap = new Map();
    }
    update(){
        var instances = this.getAllInstancesUseCase.execute(); //should probs go through controller but not worth it.

        instances.map(i=>{
            if(!this.UIMap.has(i)){
                let item = new SmallInstanceDisplay(i);
                item.prependTo(this.container);
                item.element.addEventListener("click",()=>{
                    this.instanceChooser.pick(i);
                });
                this.UIMap.set(i,item);
            }else{
                this.UIMap.get(i).update(i);
            }
        });

        for(let [key,value] of this.UIMap){
            if(!instances.some(i=>i.name == key.name)){
                var item = this.UIMap.get(key);
                if(!item){
                    continue;
                }
                item.destroy();
                this.UIMap.delete(key);
            }
        }
    }
}
