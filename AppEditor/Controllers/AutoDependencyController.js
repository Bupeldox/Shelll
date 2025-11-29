export class AutoDependencyController {
    constructor({ autoFillAllInjectionsUseCase, instancesDisplayUI, sidePanelManager }) {
        this.autoFillAllInjectionsUseCase = autoFillAllInjectionsUseCase;
        this.instancesDisplayUI = instancesDisplayUI;
        this.sidePanelManager = sidePanelManager;
    }
    all() {
        this.autoFillAllInjectionsUseCase.execute();
        this.instancesDisplayUI.update();
        this.sidePanelManager.changeToApp();
    }
}
