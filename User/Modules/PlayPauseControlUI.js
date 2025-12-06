class PlayPauseControlUI {
    onDependencySet() {
        var requiredDependencies = [
            this.document,
            this.playController,
            this.container
        ];
        if (requiredDependencies.some(i => !i)) {
            if (this._element) {
                this._element.remove();
            }
            return;
        }
        this._setupElement();
    }
    _setupElement() {
        if (this._element) {
            this._element.remove();
        }
        this._element = this.document.createElement("button");
        this._element.textContent = "X";
        this._element.addEventListener("click", () => { this._onClick(); });
        this.container.appendChild(this._element);
    }
    _onClick() {
        this.playController?.playPause();
    }
    updatePlaying(playing) {
        if (!this._element) { return; }
        if (playing) {
            this._element.textContent = "Pause";
        } else {
            this._element.textContent = "Play"
        }
    }
}


export default {
    Dependencies: [ //properties that get set on this at any point
        {name:"container",interface:{name:"IContainerV0",functions:[{ name: "appendChild", param: ["String"], returns: null }]}},
        {name:"playController",interface: {name: "IAudioControllerV0",functions: [    { name: "playPause", param: null, returns: null },]}},
        {name:"document",interface: {name: "IElementRootV0",functions: [    { name: "createElement", param: ["String"], returns: ["HTMLElement"] }]}}
    ],
    Interface: {//functions available on this.
        name: "IPlayPauseUIV0",
        functions: [//functions available on this.
            { name: "updatePlaying", param: ["Boolean"], returns: null }
        ]
    },
    module: PlayPauseControlUI,
    name: "PlayPauseControlUI"
};