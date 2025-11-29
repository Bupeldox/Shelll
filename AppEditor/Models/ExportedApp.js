class App{
    constructor(){
        this.nodes = [];
        this.edges = [];
        this.name = "";
        this.description = "";
    }
}
class Node{
    constructor(){
        this.name;
        this.typeName;
    }
}
class Edge{
    constructor(){
        this.fromName;
        this.fromProperty;
        this.toName;
    }
}

export default {
    App,Node,Edge
}