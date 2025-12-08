

class ToDoItem{
    constructor(name){
        this.name = name;
        this.done = false;
        this.doneDate = null;
    }
}

class ToDoItemService{
    constructor({repo}){
        this.repo = repo;
    }
    read(){
        return this.repo.getAll();
    }
    create(){
        var newItem = new ToDoItem("");
        return newItem;
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




export default {
    Dependencies: [
        {
            name: "repo",
            interface: {
                name: "IRepoV0",
                functions: [
                    {name:"save",params:["any"]},
                    {name:"getAll",params:[false]},
                    {name:"remove",params:["any"]},
                ]
            }
        },
    ],
    module: ToDoItemService,
    Interface: {
        name:"IServiceV0",
        functions:[
            {name:"create",params:[]},
            {name:"read",  params:[]},
            {name:"update",params:["item"]},
            {name:"delete",params:["item"]},
        ]
    },
    name: "ToDoItemService"
}
