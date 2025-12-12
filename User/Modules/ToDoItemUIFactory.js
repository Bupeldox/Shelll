

class ToDoItemUI{
    constructor(el){
        this.element = el;
    }
    display(item){
        
        this.element.querySelector(".done").textContent = item.done?"X":" ";
        this.element.querySelector(".name").textContent = item.name;
    }

}

class ToDoItemUIFactory{
    constructor({document, container}){
        this.document = document;
        this.container = container;
    }   
    createUI(container){
        const html = `<span>[<span class="done"> </span>]</span> <span class="name"></span>`;
        let element = this.document.createElement("div");
        element.innerHTML = html;
        container.append(element);
        return new ToDoItemUI(element);
    }
}


export default {
    Dependencies: [
        {name:"document",interface:{name:"IElementRootV0"}},
    ],
    module: ToDoItemUIFactory,
    Interface: {
        name:"IUIFactory",
        functions:[
            {name:"createUI", params:"container:IElement", returns:"IUI"}
        ]
    },
    name: "ToDoItemUIFactory"
}