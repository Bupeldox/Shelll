
export default function DragPanHandler ({controller}){
    const canvas = document.querySelector('.transformCanvas');
    const bg = document.querySelector(".transformCanvasBackground");
let panning = false;
let scale = 1;
let offsetX = 0, offsetY = 0;


[...document.querySelectorAll(".transformElement")].map(i=>{
    var startX = +(i.getAttribute("startx")||0);
    var startY = +(i.getAttribute("starty")||0);
    updateElementPosition(i,startX,startX);
})

function updateElementPosition(element,x,y){
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
}

bg.addEventListener('mousedown', (e) => {
    if(e.target.classList.contains("transformNoInteraction")){
        return;
    }
    if (e.target.classList.contains('transformElement') && !e.target.classList.contains('transformElement-static') ) {
        const element = e.target;
        const rect = element.getBoundingClientRect();

        // Calculate offsets to the mouse considering the canvas transformations
        const offset = {
            x: e.clientX - rect.left,// - offsetX,
            y: e.clientY - rect.top,// - offsetY,
        };

        const moveElement = (moveEvent) => {
            const canvasRect = canvas.getBoundingClientRect();
            const newX = moveEvent.clientX - offset.x - canvasRect.left;
            const newY = moveEvent.clientY - offset.y - canvasRect.top;

            updateElementPosition(element,newX,newY);
            // Notify the element of its new position
            element.onDragUpdate && element.onDragUpdate({
                left: newX,
                top: newY,
            });
            controller.onElementDrag(element,newX,newY);
        };

        const stopDragging = () => {
            document.removeEventListener('mousemove', moveElement);
            document.removeEventListener('mouseup', stopDragging);
        };

        document.addEventListener('mousemove', moveElement);
        document.addEventListener('mouseup', stopDragging);
    } else {
        // Initiate panning
        panning = true;
        const startX = e.clientX - offsetX;
        const startY = e.clientY - offsetY;

        const pan = (moveEvent) => {
            offsetX = moveEvent.clientX - startX;
            offsetY = moveEvent.clientY - startY;
            canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;

            // Move the background to create the effect of it moving with the canvas
            bg.style.backgroundPosition = `${offsetX}px ${offsetY}px`;

            
        };

        const stopPanning = () => {
            panning = false;
            document.removeEventListener('mousemove', pan);
            document.removeEventListener('mouseup', stopPanning);
        };

        document.addEventListener('mousemove', pan);
        document.addEventListener('mouseup', stopPanning);
    }
});

document.addEventListener("mousemove",(e)=>{
        const canvasRect = canvas.getBoundingClientRect();
    const offset = {
        x: e.clientX - canvasRect.left,// - offsetX,
        y: e.clientY - canvasRect.top,// - offsetY,
    };
    controller.onMouseMove(offset.x,offset.y)
});

bg.addEventListener('wheel', (e) => {
    e.preventDefault();

    // Calculate the mouse position relative to the canvas
    const canvasRect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;

    // Get previous scale to adjust the offset
    const previousScale = scale;

    // Update the scale based on the wheel motion
    scale += e.deltaY * -0.001;
    scale = Math.min(Math.max(.125, scale), 4); // Restrict scale between 0.125 and 4

    // Calculate how much the scale has changed
    const scaleChange = scale / previousScale;

    // Adjust offsets to zoom in on the mouse position
    offsetX = mouseX - (mouseX - offsetX) * scaleChange;
    offsetY = mouseY - (mouseY - offsetY) * scaleChange;


    canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;

    // Adjust background size based on the scale
    const bgSize = 100 * scale;  // Adjust the background size relative to zoom level
    bg.style.backgroundSize = `${bgSize}% ${bgSize}%`; 
});


}