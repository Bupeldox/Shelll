export class AppUI{
    constructor({app}){
        this.app = app;
        this.nameElement = document.getElementById("appName")
        this.descElement = document.getElementById("appDesc")
        this._events();
    }
    _events(){
        this.nameElement.addEventListener("input",(e)=>this.app.name = e.target.value);
        this.descElement.addEventListener("input",(e)=>this.app.description = e.target.value);
    }
    update(){
        this.nameElement.value = this.app.name;
        this.descElement.value = this.app.description;
    }
}