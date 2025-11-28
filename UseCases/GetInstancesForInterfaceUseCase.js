
export class GetInstancesForInterfaceUseCase{
    constructor({app}){
        this.app = app;
    }   

    execute(tinterface){
        return this.app.instances.filter(i=>i.module.interface.name == tinterface.name)
    }   
}