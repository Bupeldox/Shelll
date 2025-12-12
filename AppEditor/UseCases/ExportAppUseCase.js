import ExportedApp from "../Models/ExportedApp.js";

export class ExportAppUseCase {
    constructor({ app }) {
        this.app = app;
    }
    execute() {
        var app = this.app;
        var exportedApp = new ExportedApp.App();
        exportedApp.name = app.name;
        exportedApp.description = app.description;

        app.instances.map(i => {
            var node = new ExportedApp.Node();
            node.name = i.name;
            node.typeName = i.module.name;
            exportedApp.nodes.push(node);
            i.injections.map(inj => {
                var edge = new ExportedApp.Edge();
                edge.fromName = inj.targetInstance.name;
                edge.toName = inj.instance.name;
                edge.fromProperty = inj.dependency.name;
                exportedApp.edges.push(edge);
            });
        });
        exportedApp.createdDate = Date().toString();
        return exportedApp;
    }
}
