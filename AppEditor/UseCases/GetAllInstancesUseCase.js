export class GetAllInstancesUseCase {
    constructor({app}){
        this.app = app;
    }
    execute(){
        return this.app.instances;
    }

}