export class App{
    constructor(){
        this.name;
        this.instances = [];
    }
}
export class Interface{
    constructor(){
        this.name;
        this.functions=[];
    }
}
export class Injection{
    constructor(dependency,targetInstance){

        this.dependency = dependency;
        this.targetInstance = targetInstance;
        this.instance;
    }
}
export class Module{
    constructor(){
        this.dependencies = [];
        this.name;
        this.interface;
    }
}
export class Dependency{
    constructor(){
        this.instance;
        this.interface;
        this.module;
    }
}
export class Instance{
    constructor(module){
        this.id = Math.random();
        this.name;
        this.injections = [];
        this.setModule(module);
    }
    setModule(module){
        this.module = module;
        this.injections = [];
        module.dependencies.map(d=>{
            this.injections.push(new Injection(
                d,
                this
            ));
        });
    }
}
