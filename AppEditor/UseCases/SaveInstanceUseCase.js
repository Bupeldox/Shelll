export class SaveInstanceUseCase{
    constructor({app}){
        this.app = app;
    }
    execute(instance){
        if(!instance.name){
            instance.name = instance.module.name+"-"+Math.random();
        }
        delete instance.isNew;

        var existingInstance = this._getInstanceById(instance.id);
        if(!existingInstance){
            this.app.instances.push(instance); 
        }else{
            existingInstance.module = instance.module;
            existingInstance.injections = instance.injections;
            existingInstance.name = instance.name;
        }
    }
    _getInstanceById(id){
        return this.app.instances.find(i=>i.id == id);
    }
}