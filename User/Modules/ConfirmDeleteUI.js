class ConfirmDeleteUI{
    constructor({cruddable,container,document}){
        this.cruddable = cruddable;
        this.container = container;
        this.document = document;
        this.myElement = false;
    }
    _createUI(){
        if(this.myElement){
            return
        }
        var html =`
<div>
    <p>Are you sure you want to delete this?:</p>
    <p class="itemContents"></p>
    <div style=display:flex;flex-flow:row norwap; max-width:500px;">
        <button class="cancelButton">Cancel</button>
        <div style="flex-grow:1;"></div>
        <button class="deleteButton" style="background-color:#fdd;">Delete</button>
    </div>
</div>
        `;
        this.myElement = this.document.createElement("div");
        this.myElement.innerHTML = html;

        this.itemContentsElement = this.myElement.querySelector(".itemContents");
        this.myElement.querySelector(".cancelButton").addEventListener("click",()=>{
            this._onCancel();
        });
        this.myElement.querySelector(".deleteButton").addEventListener("click",()=>{
            this._onConfirm()
        });

        this.container.appendChild(this.myElement);
    }
    display(item){
        this._createUI();
        this.itemContentsElement.textContent = JSON.stringify(item,null,3);
        this.itemToDelete = item;
        
    }
    _onCancel(){
        this.myElement.style.display = "none";
    }
    _onConfirm(){
        this.cruddable.delete(this.itemToDelete);
        this.myElement.style.display = "none";
    }
}




export default {
    Dependencies: [
        {
            name: "cruddable",
            interface: {
                name: "ICruddableV0",
                functions: [
                    {name:"delete",params:["any"]},
                ]
            }
        },
        {name:"document",interface:{name:"IElementRootV0"}},
        {name:"container",interface:{name:"IContainerV0"}}

    ],
    module: ConfirmDeleteUI,
    Interface: {
        name:"IDeleteUIV0",
        functions:[
            {name:"display", params:["any"]}
        ]
    },
    name: "ConfirmDeleteUI"
}
