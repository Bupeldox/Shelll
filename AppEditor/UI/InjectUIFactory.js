import { InjectionController } from "../Controllers/InjectionController.js";
import { InjectionUI } from "./InjectionUI.js";

export class InjectUIFactory {
    constructor({
        instanceChooser, autoFillInjectionUseCase, createInstanceControllerIsh,instancesDisplayUI
    }) {

        this.autoFillInjectionUseCase = autoFillInjectionUseCase;
        this.instanceChooser = instanceChooser;
        this.createInstanceControllerIsh = createInstanceControllerIsh;
        this.instancesDisplayUI = instancesDisplayUI;
    }
    createUI(injection, container) {
        var controller = new InjectionController({
            injection,
            injectionUI,
            instanceChooser: this.instanceChooser,
            autoFillInjectionUseCase: this.autoFillInjectionUseCase,
            createInstanceControllerIsh: this.createInstanceControllerIsh,
            instancesDisplayUI: this.instancesDisplayUI
        });

        var injectionUI = new InjectionUI({
            injection, //should probs be a viewmodel
            container,
            controller
        });

        controller.injectionUI = injectionUI;

        return injectionUI;
    }
}
