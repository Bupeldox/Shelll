//Definition End
export class ResetAppUseCase {
    constructor({ app }) {
        this.app = app;
    }
    execute() {
        this.app.instances = [];
        this.app.name = "";
        this.app.description = "";
    }
}
