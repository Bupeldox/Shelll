



class AudioController {
    constructor() {
        this.ui;
        this.document;
        this.playing = false;
        this.toLoad = false;
        this.element = false;
    }
    set playing(v) {
        this._playing = v;
        this.ui?.updatePlaying(v);
    }
    get playing() { return this._playing; }
    onDependencySet() {
        var requiredDependencies = [
            this.ui,
            this.document
        ];
        if (this.document && !this.element) {
            this.element = this.document.createElement("audio");
            this.element.style.display = "none";
            this.document.body.appendChild(this.element);

            this.load(this.src);

        }
    }
    load(src) {
        this.playing = false;
        this.src = src;
        this.ui?.updatePlaying(false);
        if (this.element) {
            this.element.src = src;
        }

    }
    playPause() {
        this.playing = !this.playing;
        if (this.playing) {
            this.element.play()
        } else {
            this.element.pause();
        }
    }
    setVolume(perc) {
        alert("todo");
    }
}


export default {
    Dependencies: [ //properties that get set on this at any point
        {
            name: "ui",
            interface: {
                name: "IPlayPauseUIv0",
                functions: [{ name: "updatePlaying", param: ["Boolean"], returns: null }]
            }
        },
        {
            name: "document",
            interface: {
                name: "IElementRootv0",
                functions: [
                    { name: "createElement", param: ["String"], returns: ["HTMLElement"] },
                    { name: "body", prop: true, type: "HTMLElement" }
                ]
            }
        }
    ],
    Interface: {//functions available on this.
        name: "IAudioControllerv0",
        functions: [
            { name: "playPause", param: null, returns: null },
            { name: "load", param: ["String"], returns: null },
        ]
    },
    module: AudioController,
    name: "Audio Controller"
};