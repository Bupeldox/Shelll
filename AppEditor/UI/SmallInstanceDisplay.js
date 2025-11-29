import TemplatedHtml from "./TemplatedHtml.js";



export class SmallInstanceDisplay {
    constructor(instance) {
        var item = new TemplatedHtml("instanceSmallDisplay");
        this.element = item.element;
        this.item = item;
        this.update(instance);

    }
    update(i) {
        this.item.setText("instanceName", i.name);
        this.item.setText("instanceModule", i.module.name);
        this.item.setText("instanceInterface", i.module.interface?.name ?? "No interface");
        if (i.injections.some(i => !i.instance)) { //should be in controller
            this.item.setText("instanceError", "missing Injects");
        } else {
            this.item.setText("instanceError", "");
        }
    }
    appendTo(container) {
        container.append(this.element);
    }
    prependTo(container) {
        container.prepend(this.element);
    }
    destroy() {
        this.element.remove();
    }
}
