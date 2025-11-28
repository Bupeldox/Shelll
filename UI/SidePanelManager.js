

export class SidePanelManager {
    constructor({ appInfoElement, instanceInfoElement }) {
        this.appInfoUI = appInfoElement;
        this.instanceInfoUI = instanceInfoElement;
    }
    _hide(el) {
        el.style.display = "none";
    }
    _show(el) {
        el.style.display = "";
    }
    changeToInstance() {
        this._show(this.instanceInfoUI);
        this._hide(this.appInfoUI);
    }
    changeToApp() {
        this._hide(this.instanceInfoUI);
        this._show(this.appInfoUI);
    }
}
