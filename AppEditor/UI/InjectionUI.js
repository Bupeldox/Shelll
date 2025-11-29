import TemplatedHtml from "./TemplatedHtml.js";
import { SmallInstanceDisplay } from "./SmallInstanceDisplay.js";

export class InjectionUI {
    constructor({
        injection, container, controller,
    }) {
        var ui = new TemplatedHtml("injection");
        container.append(ui.element);

        this.ui = ui;
        this.injection = injection;
        this.controller = controller;

        ui.setText("t-name", injection.dependency.name);
        ui.setText("t-interface", injection.dependency.interface?.name ?? "No interface");
        ui.setValue("injectionId", injection.id);

        ui.getElement("injectionChoose").addEventListener("click", () => { this.controller.chooseInstance(); });
        ui.getElement("injectionAuto").addEventListener("click", () => { this.controller.autoChooseInject(); });
        ui.getElement("injectionCreate").addEventListener("click", () => { this.controller.createInstanceForInject(); });
        ui.getElement("removeCurrentInstance").addEventListener("click", () => { this.controller.removeInjectedInstance(); });

        this.updateInstanceDisplay();
    }
    destroy() {
        this.ui.element.remove();
    }
    updateInstanceDisplay() {
        if (this.injection.instance) {
            this.ui.getElement("chosenInstance").style.display = "";
            this.ui.getElement("instanceChoosing").style.display = "none";
            if (!this.instanceUI) {
                this.instanceUI = new SmallInstanceDisplay(this.injection.instance);
                this.instanceUI.appendTo(this.ui.getElement("chosenInstanceContainer"));
            } else {
                this.instanceUI.update(this.injection.instance);
            }
        } else {
            this.ui.getElement("chosenInstance").style.display = "none";
            this.ui.getElement("instanceChoosing").style.display = "";
            if (this.controller.canBeAutoFilled() == 1) {
                this.ui.getElement("injectionChoose").style.display = "none";
                this.ui.getElement("injectionAuto").style.display = "";
            } else {
                this.ui.getElement("injectionChoose").style.display = "";
                this.ui.getElement("injectionAuto").style.display = "none";
            }
        }
    }
}
