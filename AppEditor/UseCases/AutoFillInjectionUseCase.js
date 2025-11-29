export class AutoFillInjectionUseCase {
    constructor({ app }) {
        this.app = app;
    }
    static Responses = {
        OK:1,
        WouldBeRecursive:2,
        NotOneModuleAvailable:3
    };
    _getByInterfaceName(name){
        return this.app.instances.filter(i=>i.module.interface && i.module.interface.name == name)
    }
    canBeAutoFilled(injection) {
        var interfaceName = injection.dependency.interface.name;
        var availableInstances = this._getByInterfaceName(interfaceName);
        if(availableInstances.length != 1){
            return AutoFillInjectionUseCase.Responses.NotOneModuleAvailable;
        }
        var instanceToUse = availableInstances[0];
        if(injection.targetInstance.id == instanceToUse){
            return AutoFillInjectionUseCase.Responses.WouldBeRecursive;
        }
        return AutoFillInjectionUseCase.Responses.OK;
    }
    execute(injection) {
        var interfaceName = injection.dependency.interface.name;
        var availableInstances = this._getByInterfaceName(interfaceName);
        if (availableInstances.length != 1) {
            throw "cant be autofilled";
        }

        var instanceToUse = availableInstances[0];
        if(injection.targetInstance.id == instanceToUse){
            throw "im not gonna do it recursive"
        }
        injection.instance = instanceToUse;
    }
}
