export class GetModulesForInterfaceUseCase{
    constructor({moduleRepo}){
        this.moduleRepo =moduleRepo
    }
    execute(tinterface){
        return this.moduleRepo.modules.filter(i=>i.interface.name == tinterface.name);
    }
}