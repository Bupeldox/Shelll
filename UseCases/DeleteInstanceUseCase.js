export class DeleteInstanceUseCase{
    constructor({app}){
        this.app = app;
    }
    execute(instance){
        this.app.instances = this.app.instances.filter(i=>i.id!=instance.id);
        this.app.instances.map(i=>{
            i.injections.map(inj=>{
                if(inj.instance.id == instance.id){
                    inj.instance = false;
                }
            });
        });
    }
}
