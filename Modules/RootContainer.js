


function RootClass() {
    return document.getElementById("appRoot");
}




export default {
    Dependencies: { //properties that get set on this at any point

    },
    Interface: {//functions available on this.
        name:"IContainerv0",
        functions:[//functions available on this.
           { name: "appendChild", param: ["HTMLElement"], returns: null }
        ]
    },
    module: RootClass,
    name: "RootElement"
};