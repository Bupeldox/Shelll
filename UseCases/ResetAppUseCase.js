//Definition End
export class ResetAppUseCase {
    constructor({ app }) {
        this.app = app;
    }
    execute() {
        this.app.injects = [];
        this.app.name = "";
        this.app.description = "";
    }
}
