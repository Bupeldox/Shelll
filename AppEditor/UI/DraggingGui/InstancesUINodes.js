import { SmallInstanceDisplay } from "../SmallInstanceDisplay.js";
import ElementToElementLine from "./ElementToElementLine.js";

export class DragInjectionController{
    constructor({
        getAllInstancesUseCase,
        container
    }){
        this.fromNode;
        this.fromIndex;
        this.fromIsTop;
        this.draggingLine = false;
        
        this.getAllInstancesUseCase = getAllInstancesUseCase;
        this.container = container;
        this.createUI();
    }
    startDrag(node,index,connectorElement){
        //highlight compatible nodes
        this.fromNode = node;
        this.fromIndex = index;
        this.fromIsTop = isTop;

        this.draggingLine = new ElementToElementLine(connectorElement,false,this.container);

    }
    
    onMouseMove(posx,posy){
        if(this.draggingLine){
            this.draggingLine.updateToPos(posx,posy);
        }
    }
    onElementDrag(element,x,y){
        element.lines.map(i=>i.update());
    }

    cancelDrag(){
        this.fromNode = undefined;
        this.fromIndex = undefined;
        this.fromIsTop = undefined;
    }
    connect(toNode){
        if(
            this.fromNode === undefined ||
            this.fromIndex === undefined ||
            this.fromIsTop === undefined ||
            toNode === undefined
        ){
            return false;
        }
    }

    createUI(){
        var instances = this.getAllInstancesUseCase.execute();
        instances.map(i=>{
            var UI = new NodeUI({connectors:i.injections,dragHelper:this,container:this.container})
            var display = new SmallInstanceDisplay(i);
            display.appendTo(UI.contentsContainer);
        });
    }
}


class NodeUI {
    constructor({connectors,container,dragHelper}){
        this.connectors = connectors;
        this.dragHelper = dragHelper;
        this.lines = [];
        
        this._createElement(container);
    }
    _createElement(container){
        var html = `
<div class="topDeps"></div>
<div class="nodeContents"></div>
<div class="bottomDeps"></div>
        `
        var createButton = (container,index,inj)=>{
            let button = document.createElement("button");
            container.append(button);
            button.classList.add("transformNoInteraction")
            button.textContent = inj.dependency.name+" - "+inj.dependency.interface.name;
            button.addEventListener("mouseDown",()=>{
                this.onTypeDown(index,button);
            });

        }
        var element = document.createElement("div");
        element.innerHTML = html;
        element.className="transformElement floating contentPadding solid-bg";
        this.contentsContainer = element.querySelector(".nodeContents")
        container.append(element);
        var topContainer = element.querySelector(".topDeps");
        var bottomContainer = element.querySelector(".bottomDeps");

        this.connectors.map((inj,ind)=>createButton(topContainer,ind,inj));
    }
    onTypeDown(index,buttonElement){
        dragHelper.startDrag(this,index,buttonElement);
    }
    onUp(line){
        this.lines.push(line);
        dragData.connect(this);
    }
}