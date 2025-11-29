import TemplatedHtml from "./TemplatedHtml.js";


export class InstanceSelectUI {
    constructor({ instanceRepo }) {
        this.dialog = document.getElementById("chooseInstanceDialog");
        this.moduleContainer = this.dialog.querySelector(".moduleOptionContainer");
        this.modules = []
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
    setAvailableInstances(instances) {
        if (this.modules.length == instances.length && this.modules.every(m => instances.some(b => b.name == m.name))) {
            return;
        }
        this.modules = instances;
        this.moduleContainer.innerHTML = "";
        instances.map(i => {
            var item = new TemplatedHtml("moduleSelect");
            var id = Math.random();
            item.setText("moduleName", i.name)
            item.setText("moduleInterface", i.module.name);
            var radio = item.getElement("moduleInstanceRadio");
            radio.value = i.name;
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
        var module = moduleRepo.getByName(chosenModuleName);
        this.onSet(module);
        this.close();
    }
    close() {
        this._isOpen = false;
        this.dialog.close();
    }
}



