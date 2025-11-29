import { SmallInstanceDisplay } from "./SmallInstanceDisplay.js";



export class InstancesDisplayUI {
    constructor({ getAllInstancesUseCase, instanceChooser }) {
        this.getAllInstancesUseCase = getAllInstancesUseCase;
        this.instanceChooser = instanceChooser;
        this.container = document.getElementById("instancesDisplay");
        this.UIMap = new Map();
    }
    update() {
        var instances = this.getAllInstancesUseCase.execute(); //should probs go through controller but not worth it.

        instances.map(i => {
            if (!this.UIMap.has(i)) {
                let item = new SmallInstanceDisplay(i);
                item.prependTo(this.container);
                item.element.addEventListener("click", () => {
                    this.instanceChooser.pick(i);
                });
                this.UIMap.set(i, item);
            } else {
                this.UIMap.get(i).update(i);
            }
        });

        for (let [key, value] of this.UIMap) {
            if (!instances.some(i => i.name == key.name)) {
                var item = this.UIMap.get(key);
                if (!item) {
                    continue;
                }
                item.destroy();
                this.UIMap.delete(key);
            }
        }
    }
}
