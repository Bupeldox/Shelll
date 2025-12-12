
class ToDoItemEditorUI{
    constructor({container, document, cruddable}){
        this.container = container;
        this.document = document;
        this.cruddable = cruddable;
        this.uiCreated = false;
    }
    _createUI(){
        if(this.uiCreated){
            this.editorContainer.style.display="";
            return;
        }
        this.uiCreated = true;
        var html = `<div>
    <div>
        <label for="doDoListItemNameInput">Name: </label>
        <input type="text" class="nameInput" id="doDoListItemNameInput"/>
    </div>
    <div>
        <label for="doDoListItemDoneInput">Done: </label>
        <input type="checkbox" class="doneInput" id="doDoListItemDoneInput"/>
    </div>
    <div>
        <button class="saveButton">Save</button>
        <button class="cancelButton">Cancel</button>
    </div>
</div>`;
        var c = this.document.createElement("div");
        c.innerHTML = html;
        this.nameInput = c.querySelector(".nameInput");
        this.doneInput = c.querySelector(".doneInput");
        c.querySelector(".saveButton").addEventListener("click",()=>{
            this._save();
        });
        c.querySelector(".cancelButton").addEventListener("click",()=>{
            this._hide();
        });
        this.container.appendChild(c);
        this.editorContainer = c;
    }
    _updateValues(item){
        this.nameInput.value = item.name;
        this.doneInput.checked = item.done;
    }
    _save(){
        this.item.name = this.nameInput.value;
        this.item.done = this.doneInput.checked;
        this.cruddable.update(this.item);
        this._hide();
    }
    _hide(){
        this.editorContainer.style.display="none";
    }
    display(item){
        this._createUI();
        this._updateValues(item)
        this.item = item;
    }
}




export default {
    Dependencies: [
        {
            name: "cruddable",
            interface: {
                name: "ICruddableV0",
                functions: [
                    {name:"update",params:["any"]},
                ]
            }
        },
        {name:"document",interface:{name:"IElementRootV0"}},
        {name:"container",interface:{name:"IContainerV0"}}

    ],
    module: ToDoItemEditorUI,
    Interface: {
        name:"IEditUIV0",
        functions:[
            {name:"display", params:["any"]}
        ]
    },
    name: "ToDoItemEditorUI"
}
