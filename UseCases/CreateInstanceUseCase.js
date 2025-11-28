import { Instance } from "../Models.js";

export class CreateInstanceUseCase{
    constructor({saveInstanceUseCase}){
        this.saveInstanceUseCase = saveInstanceUseCase;
        
    }
    execute(module){
        var instance = new Instance(module);
        instance.name = "";
        this.saveInstanceUseCase.execute(instance);
        return instance;
    }
}