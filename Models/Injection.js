export class Injection {
    constructor(dependency, targetInstance) {

        this.dependency = dependency;
        this.targetInstance = targetInstance;
        this.instance;
    }
}
