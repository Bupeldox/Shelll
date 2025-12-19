export default class ElementToElementLine {
    constructor(from, to, container) {
        this.from = from;
        this.to = to;
        this.container = container;
        this.line = document.createElement('div');
        this.line.style.position = 'absolute';
        this.line.style.backgroundColor = 'black'; // Change color as needed
        this.line.style.height = '2px'; // Change thickness as needed
        this.container.appendChild(this.line);
        this.update(); // Initial positioning
    }
    destroy(){
        this.line.remove();
        delete this;
    }
    update() {
        const fromRect = this.from.getBoundingClientRect();
        const toRect = this.to.getBoundingClientRect();

        // Calculate the center positions of the elements
        const fromX = fromRect.left + fromRect.width / 2;
        const fromY = fromRect.top + fromRect.height / 2;
        const toX = toRect.left + toRect.width / 2;
        const toY = toRect.top + toRect.height / 2;

        this._update(fromX,fromY,toX,toY);
    }
    updateToPos(toX,toY){
        const fromRect = this.from.getBoundingClientRect();

        // Calculate the center positions of the elements
        const fromX = fromRect.left + fromRect.width / 2;
        const fromY = fromRect.top + fromRect.height / 2;
        
        this._update(fromX,fromY,toX,toY);
    }
    _update(fromX,fromY,toX,toY){
        // Calculate the length and angle for the line
        const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
        const angle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI);

        // Set line style
        this.line.style.width = length + 'px';
        this.line.style.transform = `translate(${fromX}px, ${fromY}px) rotate(${angle}deg)`;
        this.line.style.transformOrigin = '0 50%'; // To rotate around the starting point
    }
}