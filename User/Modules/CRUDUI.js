
class CRUDUI {
    constructor({cruddable,document,container}) {
        this.items = [];
        this.cruddable = cruddable;
        this.document = document;
        this.container = container; 
    }
    display(items){
        this._createContainer();
        this.items = items;
        this.itemsContainer.innerHTML = "";
        this.items.map((i,ind)=>{this._createElement(i,ind)});
    }
    _createContainer(){
        if(this.itemsContainer){
            return;
        }

        var html = `
        <div>
            <button class="createButton">Create</button>
            <div class="itemsContainer">
            
            </div>
        </div>
        `
        var container = this.document.createElement("div");
        container.outerHTML = html;
        var createButton = container.querySelect(".createButton");
        createButton.addEventListener("click",()=>{this.cruddable.create()});
        this.itemsContainer = container.querySelect(".itemsContainer");
        this.container.append(container);
    }
    _createElement(item,id){
        var html = `
        <div>
            <div class="textContainer"></div>
            <div>
                <button class="editButton">Edit</button>
                <button class="deleteButton">Delete</button>
            </div>
        </div>
        `;
        var container = this.document.createElement("div");
        container.outerHTML = html;
        var textContainer = container.querySelect(".textContainer");
        var editButton = container.querySelect(".editButton");
        var deleteButton = container.querySelect(".deleteButton");

        textContainer.textContent = item.text;

        editButton.addEventListener("click",()=>{this._onEditItem(id)});
        deleteButton.addEventListener("click",()=>{this._onDeleteItem(id)})
    }
    _onEditItem(id){
        this.cruddable.update(this.items[id]);
    }
    _onDeleteItem(id){
        this.cruddable.delete(this.items[id]);
    }
}


export default {
    Dependencies: [
        {
            name: "cruddable",
            interface: {
                name: "ICruddableV0",
                functions: [
                    {name:"create",params:false},
                    {name:"update",params:["any"]},
                    {name:"delete",params:["any"]},
                ]
            }
        },
        {name:"document",interface:{name:"IElementRootV0"}},
        {name:"container",interface:{name:"IContainerV0"}}

    ],
    module: CRUDUI,
    Interface: {
        name:"IListDisplayV0",
        functions:[
            {name:"display", params:"[{text:string,item:any}]"}
        ]
    },
    name: "CRUDUI"
}
