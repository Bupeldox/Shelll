export class AppController {
    constructor({
        exportAppUseCase,
        importAppUseCase,
        resetAppUseCase,
        jSONDownloader,
        instancesDisplayUI,
        sidePanelManager,
        appUI
    }) {
        this.exportAppUseCase = exportAppUseCase;
        this.importAppUseCase = importAppUseCase;
        this.resetAppUseCase = resetAppUseCase;

        this.jSONDownloader = jSONDownloader;  
        this.instancesDisplayUI = instancesDisplayUI;
        this.sidePanelManager = sidePanelManager;
        this.appUI = appUI;
    }
    import(fileName,content) {
        if(!fileName,toString().match(/\.json$/)){
            return;//show error
        }
        try{
            var parsed = JSON.parse(content);
        }catch(e){
            throw "invalid json"
            return;//show error
        }
        //should probs prompt it will overwrite everythin
        if(!confirm("this will overwrite, that ok?")){
            return;
        }
        this.resetAppUseCase.execute();
        this.importAppUseCase.execute(parsed);

        this.instancesDisplayUI.update();
        this.sidePanelManager.changeToApp();
        this.appUI.update();
    }
    export() {
        var exportedApp = this.exportAppUseCase.execute();
        this.jSONDownloader.download(exportedApp.name,exportedApp);
    }
}
