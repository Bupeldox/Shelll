

export class ImportAppUseCase {
    constructor({
        app,
        createInstanceUseCase, 
        setInjectionToInstanceUseCase, 
        moduleRepo,
        getAllInstancesUseCase
    }) {
        this.app = app;
        this.getAllInstancesUseCase = getAllInstancesUseCase;
        this.createInstanceUseCase = createInstanceUseCase;
        this.setInjectionToInstanceUseCase = setInjectionToInstanceUseCase;
        this.moduleRepo = moduleRepo;
    }

    execute(exportedApp) {
        this.app.name = exportedApp.name;
        this.app.description = exportedApp.description;
        
        exportedApp.nodes.map(node => {
            let module = this.moduleRepo.getByName(node.typeName);
            let instance = this.createInstanceUseCase.execute(module);
            instance.name = node.name;
        });
        exportedApp.edges.map(edge => {
            /*
                this.fromName;
                this.fromProperty;
                this.toName;
            */
            let toInstance = this.getAllInstancesUseCase.execute().find(i => i.name == edge.toName);
            let instance = this.getAllInstancesUseCase.execute().find(i => i.name == edge.fromName);
            let injectToSet = instance.injections.find(i => i.dependency.name == edge.fromProperty);
            this.setInjectionToInstanceUseCase.execute(injectToSet, toInstance);
        });
    }
}
