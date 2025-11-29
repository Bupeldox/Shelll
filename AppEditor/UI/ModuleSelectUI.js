import TemplatedHtml from "./TemplatedHtml.js";



export class ModuleSelectUI {
    constructor() {
        this.dialog = document.getElementById("chooseModuleDialog");
        this.moduleContainer = this.dialog.querySelector(".moduleOptionContainer");
        this.modules = [];
        this._events();
    }
    _events() {
        this.dialog.querySelector(".chooseButton").addEventListener("click", () => {
            this.choose();
        });
        this.dialog.querySelector(".closeButton").addEventListener("click", () => {
            this.close();
        });
        this.dialog.addEventListener("close", () => {
            this._onClose();
        });
    }
    setAvailableModules(modules) {
        if (this.modules.length == modules.length && this.modules.every(m => modules.some(b => b.name == m.name))) {
            return;
        }
        this.modules = modules;
        this.moduleContainer.innerHTML = "";
        modules.map(m => {
            var item = new TemplatedHtml("moduleSelect");
            var id = Math.random();
            item.setText("moduleName", m.name);
            item.setText("moduleInterface", m.interface?.name ?? "No Interface");
            var radio = item.getElement("moduleInstanceRadio");
            radio.value = m.name;
            radio.id = id;
            item.element.setAttribute("for", id);
            this.moduleContainer.append(item.element);
        });
    }
    _onClose() {

        this._isOpen = false;
    }
    open(onSet) {
        if (this._isOpen) {
            return;
        }
        this._isOpen = true;
        this.onSet = onSet;
        this.dialog.showModal();
    }
    choose() {
        var chosenModuleName = this.dialog.querySelector(".moduleInstanceRadio:checked").value;
        var module = this.modules.find(i => i.name == chosenModuleName);
        this.onSet(module);
        this.close();
    }
    close() {
        this._isOpen = false;
        this.dialog.close();
    }
}
