import { Injection } from "./Injection.js";

export class Instance {
    constructor(module) {
        this.id = Math.random();
        this.name;
        this.injections = [];
        this.setModule(module);
    }
    setModule(module) {
        this.module = module;
        this.injections = [];
        module.dependencies?.map(d => {
            this.injections.push(new Injection(
                d,
                this
            ));
        });
    }
}
