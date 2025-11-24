
export class ModuleRepo {
    constructor() {
        this.modules = [];
        
        this._notLoaded = {};
        this._allowAllLoadedCall = false;
        this.onAllLoadedCall = [];
    }
    loadModule(src) {
        this._notLoaded[src] = 1;
        import(src).then(m => {
            m = m.default;
            m.src = src;
            
            if (this.modules.some(i => i.name == m.name)) {
                return;
            }
            
            this.modules.push(m);
            
            delete this._notLoaded[src];
            this._onLoad()
        });
    }
    allowAllLoadedCall(){
        this._allowAllLoadedCall = true;
        this._onLoad();
    }
    registerOnAllLoaded(func){
        this.onAllLoadedCall.push(func);
        this._onLoad();
    }
    _onLoad(){
        if(!this.allowAllLoadedCall){
            return;
        }
        if(Object.keys(this._notLoaded).length != 0){
            return;
        }
        this.onAllLoadedCall.map(i=>i());
        this.onAllLoadedCall = [];
    }
    getByName(name){
        return this.modules.find(i=>i.name == name);
    }
}

export class InstanceRepo{
    constructor(app){
        this.app = app;
    }
    getById(name){
        return this.app.instances.find(i=>i.name == name);
    }
    getByInterface(interfaceName){
        return this.app.instances.find(i=>i.module.interface.name == interfaceName);
    }
}