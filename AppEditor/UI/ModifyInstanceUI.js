export class ModifyInstanceUI {
    constructor({
        moduleRepo, chooseModuleUI, saveInstanceUseCase, instanceChooser, controller
    }) {
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
    _events() {
        this.element.querySelector(".saveButton").addEventListener("click", () => {
            this.controller.save(this.instance);
        });
        this.element.querySelector(".cancelButton").addEventListener("click", () => {
            this.controller.cancelEdit();
        });
        this.element.querySelector(".deleteButton").addEventListener("click", () => {
            this.controller.deleteInstance(this.instance);
        });
    }
    open(instance) {
        if (!instance) {
            throw "no instance";
        }
        this.instance = instance;
        this._displayInstanceValues();
        this._updateInjectionUI();
    }
    _displayInstanceValues() {
        this.element.querySelector(".instanceName").value = this.instance.name;

        this.selectedModuleDisplay.textContent = this.instance.module.name;
        this.selectedModuleInterfaceDisplay.textContent = this.instance.module.interface?.name ?? "No Interface";
    }
    setModule(module) {
        this.instance.setModule(module);
        this._updateInjectionUI();
        this._displayInstanceValues();

    }
    _updateInjectionUI() {
        this.injectionUIs.map(i => i.destroy());
        this.injectionUIs = [];

        if (!this.instance.injections.length) {
            this.injectionContainer.textContent = "No Dependencies";
            return;
        }
        this.injectionContainer.textContent = "";
        this.instance.injections.map(i => {
            var injectionUI = this.injectUIFactory.createUI(i, this.injectionContainer);
            this.injectionUIs.push(injectionUI);
        });
    }
    clearErrors() {
    }
    showError(err) {
    }
}
