




class AudioLoader{
    onDependencySet(){
        if(this.loadable){
            this.loadable.load("./Fake Phone Calls.mp3");
        }
    }
}


export default {
    Dependencies: [ //properties that get set on this at any point
        {name:"loadable",interface:{name:"IAudioControllerv0",functions:[{ name: "load", param: ["String"], returns: null }]}}
    ],
    Interface: false,
    module: AudioLoader,
    name: "AudioLoader"
};