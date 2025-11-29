 export class GetAllModulesUseCase{
    constructor({moduleRepo}){
        this.moduleRepo = moduleRepo;
    }
    execute(){
        return this.moduleRepo.getAll();
    }
        
 }
 