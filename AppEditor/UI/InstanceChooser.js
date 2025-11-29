



export class InstanceChooser {
    constructor({ instanceController }) {
        this.instanceController = instanceController;
        this.instance = false;
        this._onPick = false;
    }
    pick(instance) {
        if (this._onPick) {
            this._onPick(instance);
            this._onPick = false;
            return;
        }
        this.instanceController.edit(instance);
    }
    registerOnPick(func) {
        this._onPick = func;
    }
}
