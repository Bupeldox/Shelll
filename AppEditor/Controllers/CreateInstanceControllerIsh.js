export class CreateInstanceControllerIsh {

    constructor({
        instanceController, 
        chooseModuleUI, 
        instancesDisplayUI, 
        getModulesForInterfaceUseCase, 
        getAllModulesUseCase, 
        createInstanceUseCase, 
        setInjectionToInstanceUseCase,
    }) {
        this.instanceController = instanceController;
        this.chooseModuleUI = chooseModuleUI;
        this.instancesDisplayUI = instancesDisplayUI;
        this.getModulesForInterfaceUseCase = getModulesForInterfaceUseCase;
        this.getAllModulesUseCase = getAllModulesUseCase;
        this.createInstanceUseCase = createInstanceUseCase;
        this.setInjectionToInstanceUseCase = setInjectionToInstanceUseCase;
    }
    createForInjection(injectionUI, injection) {
        var modules = this.getModulesForInterfaceUseCase.execute(injection.dependency.interface);
        this.chooseModuleUI.setAvailableModules(modules);
        this.chooseModuleUI.open((module) => {
            var instance = this.createInstanceUseCase.execute(module);
            this.setInjectionToInstanceUseCase.execute(injection, instance);
            this.instancesDisplayUI.update();
            injectionUI.updateInstanceDisplay();
        });
    }
    create() {
        var modules = this.getAllModulesUseCase.execute();
        this.chooseModuleUI.setAvailableModules(modules);
        this.chooseModuleUI.open((module, autofill) => {
            var instance = this.createInstanceUseCase.execute(module);
            this.instancesDisplayUI.update();
            this.instanceController.edit(instance);
        });
    }
}
