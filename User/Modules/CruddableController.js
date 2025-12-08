
//save remove getall


class CruddableController{
    constructor({
        editUI,
        deleteUI,
        listUI,
        service
    }){
        this.deleteUI = deleteUI;
        this.editUI = editUI;
        this.listUI = listUI;
        this.service = service;
    }
    read(){
        var items = this.service.read();
        this.listUI.display(items);
    }
    beginUpdate(item){
        this.editUI.display(item);
    }
    update(item){
        this.service.update(item);
        this.read();
    }
    beginCreate(){
        var item = this.service.create();
        this.editUI.display(item);
    }
    beginDelete(item){
        this.deleteUI.display(item);
    }
    delete(item){
        this.service.delete(item);
        this.read();
    }
}



export default {
    Dependencies: [
        {name:"editUI",             interface:{name:"IEditUIV0",         functions:[{name:"display",params:["any"]}]}},
        {name:"deleteUI",           interface:{name:"IDeleteUIV0",       functions:[{name:"display",params:["any"]}]}},
        {name:"listUI",             interface:{name:"IListUIV0",         functions:[{name:"display",params:["any"]}]}},
        {name:"service",  interface:{
            name:"IServiceV0",
            functions:[
                {name:"create",params:[]},
                {name:"read",  params:[]},
                {name:"update",params:["item"]},
                {name:"delete",params:["item"]},
            ]
        }},
    ],
    module: CruddableController,
    Interface: {
        name: "ICruddableV0",
        functions: [
            {name:"read",params:false},
            {name:"create",params:false},
            {name:"update",params:["any"]},
            {name:"delete",params:["any"]},
        ]
    },
    name: "CruddableController"
}
