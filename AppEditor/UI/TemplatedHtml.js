export default class TemplatedHtml{
    constructor(templateClassName){
        var templateElement = document.querySelector("#templates ."+templateClassName);
        this.element = templateElement.cloneNode(true);
    }
    getElement(elClassName){
        return this.element.querySelector("."+elClassName);
    }
    setText(elClassName,content){
        this.element.querySelector("."+elClassName).textContent = content;
    }
    setSelectListOptions(elClassName,values,selected){
        var selectList = this.element.querySelector("."+elClassName);
        selectList.innerHTML = "";
        values.map(v=>{
            var optionElement = document.createElement("option");
            if(v.hasOwnProperty("text")){
                optionElement.textContent = v.text;
                optionElement.value = v.value;
            }else{
                optionElement.textContent = v;
                optionElement.value = v;
            }
            if(optionElement.value == selected){
                optionElement.selected="true";
            }
        });
    }
    setValue(elClassName,value){
        this.element.querySelector("."+elClassName).value = value;
    }
    destroy(){
        this.element.remove();
    }
}