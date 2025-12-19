import mod from "./AnythingRepo.js";
const AnythingRepo = mod.module;

class HeirarchyRecord{
    constructor(item,parentId){
        this.id = Math.random();
        this.parentId = parentId;
        this.item = item;
    }
}

class HeirarchyItem{
    constructor(item,parent){
        this.item = item;
        this.parent = parent;
        this.siblings = [];
    }
}

class HeirarchyService{
    /**
     * 
     * @param {Object} o 
     * @param {AnythingRepo} o.repo
     */
    constructor({repo}){
        this.repo = repo;
    }
    read(){
        var all = this.repo.getAll();
        var root = all.filter(i=>i.parentId == null);
        if(root.length > 1){
            var newRoot = this.create(null);

            root = root[0];
        }
    }
    
    create(parentId,item){
        var newItem = new HeirarchyRecord(item,parentId);
        this.repo.s
    }
    update(item){
        if(item.done && item.doneDate == null){
            item.doneDate = Date.now();
        }
        this.repo.save(item);
    }
    delete(item){
        this.repo.remove(item);
    }
}   