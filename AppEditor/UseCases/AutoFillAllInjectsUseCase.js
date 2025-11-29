export class AutoFillAllInjectionsUseCase{
    constructor({getAllInstancesUseCase,autoFillInjectionUseCase,autoFillInjectWithNewInstanceUseCase}){
        this.getAllInstances = getAllInstancesUseCase;
        this.autoFillInjectionUseCase = autoFillInjectionUseCase;
        this.autoFillInjectWithNewInstanceUseCase = autoFillInjectWithNewInstanceUseCase
        this.maxCount = 5;
    }
    execute(loopCount = 1){
        var instances = this.getAllInstances.execute();
        var newInstanceCount = 0;
        instances.map(ins=>{
            ins.injections.map(inj=>{
                if(inj.instance){
                    return;
                }
                try{
                    this.autoFillInjectionUseCase.execute(inj);
                    return;
                }catch(ex){
                    
                }

                try{
                    this.autoFillInjectWithNewInstanceUseCase.execute(inj);
                    newInstanceCount++;
                    return
                }catch(ex){

                }
            })
        });

        if(newInstanceCount == 0 || loopCount >= this.maxCount){
            return;
        }
        this.execute(loopCount+1);
    }
}