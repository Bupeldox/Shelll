




class AudioLoader{
    onGraphComplete(){
        if(this.loadable){
            this.loadable.load("/User/GimmeGimmeGimmie.mp3");
        }
    }
}


export default {
    Dependencies: [ //properties that get set on this at any point
        {name:"loadable",interface:{name:"IAudioControllerV0",functions:[{ name: "load", param: ["String"], returns: null }]}}
    ],
    Interface: false,
    module: AudioLoader,
    name: "LoadTheAudio"
};