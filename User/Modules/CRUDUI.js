
class CRUDUI {
    constructor({cruddable, document, container}) {
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

        var html = `<div>
    <button class="createButton">Create</button>
    <div class="itemsContainer">
    
    </div>
</div>`
        var container = this.document.createElement("div");
        container.innerHTML = html;
        var createButton = container.querySelector(".createButton");
        createButton.addEventListener("click",()=>{this.cruddable.beginCreate()});
        this.itemsContainer = container.querySelector(".itemsContainer");
        this.container.append(container);
    }
    _createElement(item,id){
        var html = `<div>
    <div class="textContainer"></div>
    <div>
        <button class="editButton">Edit</button>
        <button class="deleteButton">Delete</button>
    </div>
</div>`;
        var container = this.document.createElement("div");
        container.innerHTML = html;
        var textContainer = container.querySelector(".textContainer");
        var editButton = container.querySelector(".editButton");
        var deleteButton = container.querySelector(".deleteButton");

        textContainer.textContent = item.name;

        editButton.addEventListener("click",()=>{this._onEditItem(id)});
        deleteButton.addEventListener("click",()=>{this._onDeleteItem(id)});

        this.itemsContainer.appendChild(container);
    }
    _onEditItem(id){
        this.cruddable.beginUpdate(this.items[id]);
    }
    _onDeleteItem(id){
        this.cruddable.beginDelete(this.items[id]);
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
        name:"IListUIV0",
        functions:[
            {name:"display", params:"[{text:string,item:any}]"}
        ]
    },
    name: "CRUDUI"
}
