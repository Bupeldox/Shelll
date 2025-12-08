
class AnythingRepo{
    constructor(){
        this.items = {};
    }
    save(item){
        var id = item.$anythingRepoId;
        if(!id){
            id = Math.random();
            item.$anythingRepoId = id;
        }
        this.items[id] = item;
    }
    remove(item){
        //Can only remove something that was added to this repo.
        var id = item.$anythingRepoId;
        delete this.items[id];
        delete item.$anythingRepoId;
    }
    getAll(){
        return Object.values(this.items);
    }
}


export default{
    Dependencies:[],
    module:AnythingRepo,
    Interface:{
        name:"IRepoV0",
        functions:[
            {name:"add",param:["any"]},
            {name:"getAll",param:false},
            {name:"remove",param:["any"]},
        ]
    },
    name:"AnythingRepo"
}
