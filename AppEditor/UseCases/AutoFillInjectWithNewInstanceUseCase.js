
import { CreateInstanceUseCase } from "./CreateInstanceUseCase.js";
import { GetModulesForInterfaceUseCase } from "./GetModulesForInterfaceUseCase.js";

export class AutoFillInjectWithNewInstanceUseCase {
    constructor({
        moduleRepo,
        getModulesForInterfaceUseCase,
        createInstanceUseCase
    }) {
        this.moduleRepo = moduleRepo;
        this.getModulesForInterfaceUseCase = getModulesForInterfaceUseCase;
        this.createInstanceUseCase = createInstanceUseCase;
    }
    execute(injection) {
        var tinterface = injection.dependency.interface;
        var modules = this.getModulesForInterfaceUseCase.execute(tinterface);
        if (modules.length != 1) {
            throw "more than 1 module";
        }
        var module = modules[0];
        if (module.interface.name == injection.targetInstance.module.interface.name) {
            throw "not making it recursive";
        }
        var instance = this.createInstanceUseCase.execute(module)

        return instance;
    }
}
