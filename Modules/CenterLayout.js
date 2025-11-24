




class CenterLayout{
    constructor(){
        this.elements = [];
        
    }
    onDependencySet(){
        if(this.container && this.document && !this.element){
            this.createElement();
            
        }
        if(!this.container && this.element){
            this.element?.remove();
            this.element = false;
        }
    }
    createElement(){
        this.element = this.document.createElement("div");
        this.element.style = "display:flex; flex-flow:row wrap; justify-content:center; align-items:center; min-height:20rem";
        this.elements.map(i=>this.element.appendChild(i));
        this.container.appendChild(this.element);
    }
    appendChild(element){
        if(this.element == element){
            return;
        }
        this.elements.push(element);
        if(this.element){
            this.element.appendChild(element);
        }
    }
}


export default {
    Dependencies: [ //properties that get set on this at any point
        {name:"container",interface:{name:"IContainerv0",functions:[{ name: "appendChild", param: ["String"], returns: null }]}},
        {name:"document",interface: {name:"IElementRootv0",functions:[{ name: "createElement", param: ["String"], returns: ["HTMLElement"] }]}}
    ],
    Interface: {//functions available on this.
        name:"IContainerv0",
        functions:[//functions available on this.
           { name: "appendChild", param: ["HTMLElement"], returns: null }
        ]
    },
    module: CenterLayout,
    name: "CenterLayout"
};