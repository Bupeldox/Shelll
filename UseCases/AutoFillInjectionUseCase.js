export class AutoFillInjectionUseCase {
    constructor({ app }) {
        this.app = app;
    }
    _getByInterfaceName(name){
        return this.app.instances.filter(i=>i.module.interface && i.module.interface.name == name)
    }
    canBeAutoFilled(injection) {
        var interfaceName = injection.dependency.interface.name;
        var availableInstances = this._getByInterfaceName(interfaceName);
        return availableInstances.length == 1;
    }
    execute(injection) {
        var interfaceName = injection.dependency.interface.name;
        var availableInstances = this._getByInterfaceName(interfaceName);
        if (availableInstances.length != 1) {
            throw "cant be autofilled";
        }
        injection.instance = availableInstances[0];
    }
}
