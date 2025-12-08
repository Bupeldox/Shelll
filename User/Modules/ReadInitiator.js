class ReadInitiator {
    constructor({readable}){
        this.readable = readable;
    }
    onGraphComplete(){
        this.readable.read();
    }
}




export default {
    Dependencies: [
        {
            name: "readable",
            interface: {
                name: "ICruddableV0",
                functions: [
                    {name:"read",params:false},
                ]
            }
        }
    ],
    module: ReadInitiator,
    Interface: false,
    name: "ReadInitiator"
}
