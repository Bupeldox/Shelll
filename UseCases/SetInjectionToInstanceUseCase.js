
export class SetInjectionToInstanceUseCase{
    execute(injection,instance){
        injection.instance = instance;
    }
}
