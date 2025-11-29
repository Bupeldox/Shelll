export class InstanceController {
    constructor({
        saveInstanceUseCase, deleteInstanceUseCase, modifyInstanceUI, sidePanelManager, instancesDisplayUI
    }) {
        this.deleteInstanceUseCase = deleteInstanceUseCase;
        this.saveInstanceUseCase = saveInstanceUseCase;
        this.modifyInstanceUI = modifyInstanceUI;
        this.sidePanelManager = sidePanelManager;
        this.instancesDisplayUI = instancesDisplayUI;

    }
    edit(instance) {
        this.modifyInstanceUI.open(instance);
        this.sidePanelManager.changeToInstance();
    }
    save(instance) {
        this.saveInstanceUseCase.execute(instance);
        this.sidePanelManager.changeToApp();
        this.instancesDisplayUI.update();
    }
    onInstanceCreated(instance) {
        this.modifyInstanceUI.open(instance);
        this.sidePanelManager.changeToInstance();
        this.instancesDisplayUI.update();
    }
    saveInstance(instance) {
        this.saveInstanceUseCase.execute(instance);
        this.sidePanelManager.changeToApp();
        this.instancesDisplayUI.update();
    }
    deleteInstance(instance) {
        this.deleteInstanceUseCase.execute(instance);
        this.instancesDisplayUI.update();
        this.sidePanelManager.changeToApp();
    }
    onInstanceRemoved() {
        this.sidePanelManager.changeToApp();
        this.instancesDisplayUI.update();
    }
    cancelEdit() {
        this.sidePanelManager.changeToApp();
    }
}
