

export class ImportAppUseCase {
    constructor({
        createInstanceUseCase, setInjectionToInstanceUseCase, moduleRepo
    }) {
        this.createInstanceUseCase = createInstanceUseCase;
        this.setInjectionToInstanceUseCase = setInjectionToInstanceUseCase;
        this.moduleRepo = moduleRepo;
    }

    execute(exportedApp) {
        exportedApp.nodes.map(node => {
            var module = this.moduleRepo.getByName(node.typeName);
            this.createInstanceUseCase.execute(module);
        });
        exportedApp.edges.map(edge => {
            var instance = this.getAllInstancesUseCase.execute().find(i => i.name == edge.fromName);
            var injectToSet = instance.injections.find(i => i.dependency.name == edge.fromProperty);
            this.setInjectionToInstanceUseCase.execute(injectToSet, instance);
        });
    }
}
