export class InjectionController {

    /**
     * @constructor
     * @param {Object} param0
     * @param {Injection} param0.injection
     * @param {InjectionUI} param0.injectionUI
     * @param {InstanceChooser} param0.instanceChooser
     * @param {AutoFillInjectionUseCase} param0.autoFillInjectionUseCase
     * @param {CreateInstanceControllerIsh} param0.createInstanceControllerIsh
     */
    constructor({
        injection, injectionUI, instanceChooser, autoFillInjectionUseCase, createInstanceControllerIsh, instancesDisplayUI,
    }) {
        this.injection = injection;
        this.autoFillInjectionUseCase = autoFillInjectionUseCase;
        this.injectionUI = injectionUI;
        this.instanceChooser = instanceChooser;
        this.createInstanceControllerIsh = createInstanceControllerIsh;
        this.instancesDisplayUI = instancesDisplayUI;
    }
    chooseInstance() {
        this.instanceChooser.registerOnPick((i) => { this._onInstancePicked(i); });

    }
    _onInstancePicked(instance) {
        this.injection.instance = instance;
        this.injectionUI.updateInstanceDisplay();
        this.instancesDisplayUI.update();
    }
    autoChooseInject() {
        this.autoFillInjectionUseCase.execute(this.injection);
        this.injectionUI.updateInstanceDisplay();
        this.instancesDisplayUI.update();
    }
    createInstanceForInject() {
        this.createInstanceControllerIsh.createForInjection(this.injectionUI, this.injection);
    }
    removeInjectedInstance() {
        this.injection.instance = false;
        this.injectionUI.updateInstanceDisplay();
        this.instancesDisplayUI.update();
    }
    canBeAutoFilled() {
        return this.autoFillInjectionUseCase.canBeAutoFilled(this.injection);
    }
}
