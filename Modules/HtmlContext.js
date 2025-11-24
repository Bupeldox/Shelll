




function HtmlDocument() {
    return document;
}


export default {
    Dependencies: { //properties that get set on this at any point

    },
    Interface: {//functions available on this.
        name:"IElementRootv0",
        functions:[//functions available on this.
            { name: "createElement", param: ["String"], returns: ["HTMLElement"] },
            { name: "body", prop: true, type: "HTMLElement" }
        ]
    },
    module: HtmlDocument,
    name: "Html Document"
};